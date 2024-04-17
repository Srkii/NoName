using System.Globalization;
using backend.Data;
using backend.DTO;
using backend.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    public class ProjectsController : BaseApiController
    {
        private readonly DataContext _context;
        public ProjectsController(DataContext context)
        {
            _context = context;
        }

        // [Authorize(Roles = "ProjectManager")]
        [HttpPost] // POST: api/projects/
        public async Task<ActionResult<Project>> CreateProject(ProjectDto projectDto)
        {
            var project = new Project
            {
                ProjectName = projectDto.ProjectName,
                Description = projectDto.Description,
                StartDate = projectDto.StartDate,
                EndDate = projectDto.EndDate,
                ProjectStatus = projectDto.ProjectStatus,
                Priority = projectDto.Priority
            };
            await _context.Projects.AddAsync(project);
            await _context.SaveChangesAsync();

            var ProjectCreator = new ProjectMember
            {
                AppUserId = projectDto.AppUserId,
                ProjectId = project.Id,
                ProjectRole = ProjectRole.ProjectManager
            };
            await _context.ProjectMembers.AddAsync(ProjectCreator);
            await _context.SaveChangesAsync();

            // dodavanje inicijalnih statusa
            await AddStarterStatuses(project);
            return project;
        }

        //metoda za dodavanje inicijalnih statusa pri kreiranju projekta
        private async Task AddStarterStatuses(Project project)
        {
            var starterStatuses = new List<TskStatus>
            {
                new TskStatus { StatusName = "Proposed", Position = 0, Project = project, Color = "#007bff" },
                new TskStatus { StatusName = "InProgress", Position = 1, Project = project, Color = "#03c3ec" },
                new TskStatus { StatusName = "InReview", Position = 2, Project = project, Color = "#20c997" },
                new TskStatus { StatusName = "Completed", Position = 3, Project = project, Color = "#71dd37" },
                new TskStatus { StatusName = "Archived", Position = 4, Project = project, Color = "#8592a3" }
            };

            _context.TaskStatuses.AddRange(starterStatuses);
            await _context.SaveChangesAsync();
        }

        // [Authorize(Roles = "ProjectManager,Member")]
        [HttpGet] // GET: api/projects/
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
        {
            var projects = await _context.Projects.ToListAsync();
            return projects;
        }

        // [Authorize(Roles = "ProjectManager,Member")]
        [HttpGet("{id}")] // GET: api/projects/2
        public async Task<ActionResult<Project>> GetProject(int id)
        {
            return await _context.Projects.FindAsync(id);
        }

        // [Authorize(Roles = "ProjectManager,Member")]
        [HttpGet("getUsersProjects/{userid}")]  // GET: api/projects/getProjects/1
        public async Task<ActionResult<IEnumerable<Project>>> GetUsersProjects(int userid)
        {
            var projects = await _context.Projects
                                         .Join(_context.ProjectMembers,
                                                project => project.Id,
                                                member => member.ProjectId,
                                                (project, member) => new { Project = project, Member = member })
                                         .Where(x => x.Member.AppUserId == userid)
                                         .Select(x => x.Project)
                                         .ToListAsync();
            return projects;
        }

        // [Authorize(Roles = "ProjectManager")]
        [HttpPut("updateProject")] // PUT: api/projects/updateProject
        public async Task<ActionResult<Project>> UpdateProject(ProjectDto projectDto)
        {
            var project = await _context.Projects.FindAsync(projectDto.AppUserId);
            if (project == null)
            {
                return NotFound();
            }

            project.ProjectName = projectDto.ProjectName;
            project.Description = projectDto.Description;
            project.StartDate = projectDto.StartDate;
            project.EndDate = projectDto.EndDate;
            project.ProjectStatus = projectDto.ProjectStatus;
            project.Priority = projectDto.Priority;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException) when (!ProjectExists(projectDto.AppUserId))
            {
                return NotFound();
            }

            return project;
        }

        private bool ProjectExists(int id)
        {
            return _context.Projects.Any(e => e.Id == id);
        }


        // Za sad mi ne treba Delete
        // [HttpDelete("{id}")] // DELETE: api/projects/2
        // public async Task<IActionResult> DeleteProject(int id)
        // {
        //     var project = await context.Projects.FindAsync(id);
        //     if (project == null)
        //     {
        //         return NotFound();
        //     }

        //     context.Projects.Remove(project);
        //     await context.SaveChangesAsync();

        //     return NoContent();
        // }
        

        [HttpPut("addProjectMember")] 
        public async Task<IActionResult> AddProjectMember(ProjectMemberDTO dto)
        {
            var projectMember = new ProjectMember 
            {
                AppUserId =  dto.AppUserId,
                ProjectId = dto.ProjectId,
                ProjectRole = dto.ProjectRole
            };
            await _context.ProjectMembers.AddAsync(projectMember);
            await _context.SaveChangesAsync();

            return Ok(projectMember);
        }
        

       [HttpGet("filterAndPaginate")]
        public async Task<ActionResult<IEnumerable<Project>>> FilterAndPaginateProjects(
            string projectName = null,
            ProjectStatus? projectStatus = null,
            Priority? projectPriority = null,
            string endDateFilter = null,
            string startDateFilter = null,
            int userId = 0,
            int currentPage = 0,
            int pageSize = 0)
        {
           var query = _context.Projects.AsQueryable();

            if (!string.IsNullOrEmpty(projectName))
            {
                query = query.Where(p => EF.Functions.Like(p.ProjectName.ToLower(), $"%{projectName.ToLower()}%"));
            }

            if (projectStatus != null)
            {
                query = query.Where(p => p.ProjectStatus == projectStatus);
            }

            if (projectPriority != null)
            {
                query = query.Where(p => p.Priority == projectPriority);
            }


            if (!string.IsNullOrEmpty(endDateFilter))
            {
                 DateTime endDate;
                switch (endDateFilter)
                {
                    case "Today1":
                        endDate = DateTime.Today;
                        query = query.Where(p => p.EndDate.Date == endDate.Date);
                        break;
                    case "Yesterday1":
                        endDate = DateTime.Today.AddDays(-1);
                        query = query.Where(p => p.EndDate.Date == endDate.Date);
                        break;
                    case "Last 7 days1":
                        var last7DaysStart = DateTime.Today.AddDays(-6);
                        query = query.Where(p => p.EndDate.Date >= last7DaysStart.Date && p.EndDate.Date <= DateTime.Today.Date);
                        break;
                    case "Last 30 days1":
                        var last30DaysStart = DateTime.Today.AddDays(-29);
                        query = query.Where(p => p.EndDate.Date >= last30DaysStart.Date && p.EndDate.Date <= DateTime.Today.Date);
                        break;
                    case "This month1":
                        var startOfMonth = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
                        var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);
                        query = query.Where(p => p.EndDate.Date >= startOfMonth.Date && p.EndDate.Date <= endOfMonth.Date);
                        break;
                    case "Last month1":
                        var startOfLastMonth = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1).AddMonths(-1);
                        var endOfLastMonth = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1).AddDays(-1);
                        query = query.Where(p => p.EndDate.Date >= startOfLastMonth.Date && p.EndDate.Date <= endOfLastMonth.Date);
                        break;
                    case "This Year1":
                        var startOfYear = new DateTime(DateTime.Today.Year, 1, 1);
                        var endOfYear = new DateTime(DateTime.Today.Year, 12, 31);
                        query = query.Where(p => p.EndDate.Date >= startOfYear.Date && p.EndDate.Date <= endOfYear.Date);
                        break;
                    case "From highest to lowest1":
                        query = query.OrderByDescending(p => p.EndDate);
                        break;
                    case "From lowest to highest1":
                        query = query.OrderBy(p => p.EndDate);
                        break;
                    default:
                        return BadRequest("Invalid end date filter option");
                }
            }

            if (!string.IsNullOrEmpty(startDateFilter))
            {
                DateTime startDate;
                switch (startDateFilter)
                {
                    case "Today":
                        startDate = DateTime.Today;
                        query = query.Where(p => p.StartDate.Date == startDate.Date);
                        break;
                    case "Yesterday":
                        startDate = DateTime.Today.AddDays(-1);
                        query = query.Where(p => p.StartDate.Date == startDate.Date);
                        break;
                    case "Last 7 days":
                        var last7DaysStart = DateTime.Today.AddDays(-6);
                        query = query.Where(p => p.StartDate.Date >= last7DaysStart.Date && p.StartDate.Date <= DateTime.Today.Date);
                        break;
                    case "Last 30 days":
                        var last30DaysStart = DateTime.Today.AddDays(-29);
                        query = query.Where(p => p.StartDate.Date >= last30DaysStart.Date && p.StartDate.Date <= DateTime.Today.Date);
                        break;
                    case "This month":
                        var startOfMonth = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
                        var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);
                        query = query.Where(p => p.StartDate.Date >= startOfMonth.Date && p.StartDate.Date <= endOfMonth.Date);
                        break;
                    case "Last month":
                        var startOfLastMonth = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1).AddMonths(-1);
                        var endOfLastMonth = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1).AddDays(-1);
                        query = query.Where(p => p.StartDate.Date >= startOfLastMonth.Date && p.StartDate.Date <= endOfLastMonth.Date);
                        break;
                    case "This Year":
                        var startOfYear = new DateTime(DateTime.Today.Year, 1, 1);
                        var endOfYear = new DateTime(DateTime.Today.Year, 12, 31);
                        query = query.Where(p => p.StartDate.Date >= startOfYear.Date && p.StartDate.Date <= endOfYear.Date);
                        break;
                    case "From highest to lowest":
                        query = query.OrderByDescending(p => p.StartDate);
                        break;
                    case "From lowest to highest":
                        query = query.OrderBy(p => p.StartDate);
                        break;
                    default:
                        return BadRequest("Invalid start date filter option");
                }
            }

            if (userId != 0)
            {
                query = query.Join(_context.ProjectMembers,
                                project => project.Id,
                                member => member.ProjectId,
                                (project, member) => new { Project = project, Member = member })
                            .Where(x => x.Member.AppUserId == userId)
                            .Select(x => x.Project);
            }

            // Apply pagination
            var filteredProjects = await query.Skip((currentPage - 1) * pageSize)
                                            .Take(pageSize)
                                            .ToListAsync();

            return filteredProjects;
        }

             [HttpGet("countFiltered")]
        public async Task<ActionResult<int>> CountFilteredProjects(
            string projectName = null,
            ProjectStatus? projectStatus = null,
            Priority? projectPriority = null,
            string endDateFilter = null,
            string startDateFilter = null,
            int userId = 0,
            int currentPage = 0,
            int pageSize = 0)
        {
           var query = _context.Projects.AsQueryable();

            if (!string.IsNullOrEmpty(projectName))
            {
                query = query.Where(p => EF.Functions.Like(p.ProjectName.ToLower(), $"%{projectName.ToLower()}%"));
            }

            if (projectStatus != null)
            {
                query = query.Where(p => p.ProjectStatus == projectStatus);
            }

            if (projectPriority != null)
            {
                query = query.Where(p => p.Priority == projectPriority);
            }


            if (!string.IsNullOrEmpty(endDateFilter))
            {
                 DateTime endDate;
                switch (endDateFilter)
                {
                    case "Today1":
                        endDate = DateTime.Today;
                        query = query.Where(p => p.EndDate.Date == endDate.Date);
                        break;
                    case "Yesterday1":
                        endDate = DateTime.Today.AddDays(-1);
                        query = query.Where(p => p.EndDate.Date == endDate.Date);
                        break;
                    case "Last 7 days1":
                        var last7DaysStart = DateTime.Today.AddDays(-6);
                        query = query.Where(p => p.EndDate.Date >= last7DaysStart.Date && p.EndDate.Date <= DateTime.Today.Date);
                        break;
                    case "Last 30 days1":
                        var last30DaysStart = DateTime.Today.AddDays(-29);
                        query = query.Where(p => p.EndDate.Date >= last30DaysStart.Date && p.EndDate.Date <= DateTime.Today.Date);
                        break;
                    case "This month1":
                        var startOfMonth = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
                        var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);
                        query = query.Where(p => p.EndDate.Date >= startOfMonth.Date && p.EndDate.Date <= endOfMonth.Date);
                        break;
                    case "Last month1":
                        var startOfLastMonth = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1).AddMonths(-1);
                        var endOfLastMonth = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1).AddDays(-1);
                        query = query.Where(p => p.EndDate.Date >= startOfLastMonth.Date && p.EndDate.Date <= endOfLastMonth.Date);
                        break;
                    case "This Year1":
                        var startOfYear = new DateTime(DateTime.Today.Year, 1, 1);
                        var endOfYear = new DateTime(DateTime.Today.Year, 12, 31);
                        query = query.Where(p => p.EndDate.Date >= startOfYear.Date && p.EndDate.Date <= endOfYear.Date);
                        break;
                    case "From highest to lowest1":
                        query = query.OrderByDescending(p => p.EndDate);
                        break;
                    case "From lowest to highest1":
                        query = query.OrderBy(p => p.EndDate);
                        break;
                    default:
                        return BadRequest("Invalid end date filter option");
                }
            }

            if (!string.IsNullOrEmpty(startDateFilter))
            {
                DateTime startDate;
                switch (startDateFilter)
                {
                    case "Today":
                        startDate = DateTime.Today;
                        query = query.Where(p => p.StartDate.Date == startDate.Date);
                        break;
                    case "Yesterday":
                        startDate = DateTime.Today.AddDays(-1);
                        query = query.Where(p => p.StartDate.Date == startDate.Date);
                        break;
                    case "Last 7 days":
                        var last7DaysStart = DateTime.Today.AddDays(-6);
                        query = query.Where(p => p.StartDate.Date >= last7DaysStart.Date && p.StartDate.Date <= DateTime.Today.Date);
                        break;
                    case "Last 30 days":
                        var last30DaysStart = DateTime.Today.AddDays(-29);
                        query = query.Where(p => p.StartDate.Date >= last30DaysStart.Date && p.StartDate.Date <= DateTime.Today.Date);
                        break;
                    case "This month":
                        var startOfMonth = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1);
                        var endOfMonth = startOfMonth.AddMonths(1).AddDays(-1);
                        query = query.Where(p => p.StartDate.Date >= startOfMonth.Date && p.StartDate.Date <= endOfMonth.Date);
                        break;
                    case "Last month":
                        var startOfLastMonth = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1).AddMonths(-1);
                        var endOfLastMonth = new DateTime(DateTime.Today.Year, DateTime.Today.Month, 1).AddDays(-1);
                        query = query.Where(p => p.StartDate.Date >= startOfLastMonth.Date && p.StartDate.Date <= endOfLastMonth.Date);
                        break;
                    case "This Year":
                        var startOfYear = new DateTime(DateTime.Today.Year, 1, 1);
                        var endOfYear = new DateTime(DateTime.Today.Year, 12, 31);
                        query = query.Where(p => p.StartDate.Date >= startOfYear.Date && p.StartDate.Date <= endOfYear.Date);
                        break;
                    case "From highest to lowest":
                        query = query.OrderByDescending(p => p.StartDate);
                        break;
                    case "From lowest to highest":
                        query = query.OrderBy(p => p.StartDate);
                        break;
                    default:
                        return BadRequest("Invalid start date filter option");
                }
            }

            if (userId != 0)
            {
                query = query.Join(_context.ProjectMembers,
                                project => project.Id,
                                member => member.ProjectId,
                                (project, member) => new { Project = project, Member = member })
                            .Where(x => x.Member.AppUserId == userId)
                            .Select(x => x.Project);
            }

            // Apply pagination
            var filteredProjects = await query.ToListAsync();

            return filteredProjects.Count;
        }


        [HttpGet("getUsersProjectsCount/{userid}")]  // GET: api/projects/getProjects/1
        public async Task<ActionResult<int>> GetUsersProjectsCount(int userid)
        {
            var projects = await _context.Projects
                                         .Join(_context.ProjectMembers,
                                                project => project.Id,
                                                member => member.ProjectId,
                                                (project, member) => new { Project = project, Member = member })
                                         .Where(x => x.Member.AppUserId == userid)
                                         .Select(x => x.Project)
                                         .ToListAsync();
            return projects.Count;
        }

        [HttpGet("getProjectByName/{projectName}")]
        public async Task<ActionResult<int>> GetProjectByName(string projectName)
        {
            var project = await _context.Projects.FirstOrDefaultAsync(project => project.ProjectName.ToLower() == projectName.ToLower());
            return Ok(project);
        }

        // vraca sve AppUser koji su na projektu (tj imaju odgovarajuci ProjectMember entry)
        [HttpGet("GetUsersByProjectId/{projectId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetUsersByProjectId(int projectId)
        {
            var users = await _context.ProjectMembers
                .Where(pm => pm.ProjectId == projectId)
                .Select(pm => new { pm.AppUserId, pm.AppUser.FirstName, pm.AppUser.LastName,pm.AppUser.Email, pm.AppUser.ProfilePicUrl, pm.ProjectRole })
                .ToListAsync();

            if (users == null)
            {
                return NotFound("No users found for the given project ID.");
            }

            return Ok(users);
        }

        [HttpGet("GetAddableUsers/{projectId}")]
        public async Task<ActionResult<IEnumerable<object>>> GetAddableUsers(int projectId)
        {
            var users = await _context.Users
            .Where(user => !_context.ProjectMembers.Any(member => member.AppUserId == user.Id && member.ProjectId == projectId) && user.Role != UserRole.Admin)
            .Select(user => new { user.Id, user.FirstName, user.LastName, user.Email, user.ProfilePicUrl })
            .ToListAsync();

            if (users == null)
            {
                return NotFound("No users found for the given project ID.");
            }

            return Ok(users);
        }
    }
}

