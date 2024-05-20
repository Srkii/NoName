using System.Globalization;
using backend.Data;
using backend.DTO;
using backend.Entities;
using backend.Interfaces;
using CloudinaryDotNet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    public class ProjectsController : BaseApiController
    {
        private readonly DataContext _context;
        private readonly INotificationService _notificationService;
        public ProjectsController(DataContext context,INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
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
            var project = await _context.Projects.FindAsync(projectDto.ProjectId);
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

        [HttpPut("addProjectMembers")] 
        public async Task<IActionResult> AddProjectMembers(ProjectMemberDTO[] dtos)
        {
            foreach (var dto in dtos)
            {
                var projectMember = new ProjectMember 
                {
                AppUserId =  dto.AppUserId,
                ProjectId = dto.ProjectId,
                ProjectRole = dto.ProjectRole
                };
                await _context.ProjectMembers.AddAsync(projectMember);
                await _context.SaveChangesAsync();   
                await _notificationService.TriggerProjectNotification(dto.ProjectId,dto.AppUserId);
            }
            return Ok(dtos);
        }
        

       [HttpGet("filterAndPaginate")]
        public async Task<ActionResult<IEnumerable<Project>>> FilterAndPaginateProjects(
            string searchText = null,
            ProjectStatus? projectStatus = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            int userId = 0,
            int currentPage = 0,
            int pageSize = 0)
        {
           var query = _context.Projects.AsQueryable();

            if (!string.IsNullOrEmpty(searchText))
            {
                query = query.Where(p =>
                    EF.Functions.Like(p.ProjectName.ToLower(), $"%{searchText.ToLower()}%") ||
                    _context.ProjectMembers
                        .Where(member => member.ProjectId == p.Id && member.ProjectRole == ProjectRole.ProjectOwner)
                        .Any(member =>
                            EF.Functions.Like(member.AppUser.FirstName + " " + member.AppUser.LastName, $"%{searchText.ToLower()}%")
                        )
                );
            }

            if (projectStatus != null)
            {
                query = query.Where(p => p.ProjectStatus == projectStatus);
            }


            if(startDate.HasValue && !endDate.HasValue)
            {
                query = query.Where(p => p.StartDate == startDate);
            }
            if(!startDate.HasValue && endDate.HasValue)
            {
                query = query.Where(p => p.EndDate == endDate);
            }
           if (startDate.HasValue && endDate.HasValue)
            {
                query = query.Where(p => p.StartDate >= startDate && p.EndDate <= endDate);
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
            string searchText = null,
            ProjectStatus? projectStatus = null,
            DateTime? startDate = null,
            DateTime? endDate = null,
            int userId = 0,
            int currentPage = 0,
            int pageSize = 0)
        {
           var query = _context.Projects.AsQueryable();

            if (!string.IsNullOrEmpty(searchText))
            {
                query = query.Where(p =>
                    EF.Functions.Like(p.ProjectName.ToLower(), $"%{searchText.ToLower()}%") ||
                    _context.ProjectMembers
                        .Where(member => member.ProjectId == p.Id && member.ProjectRole == ProjectRole.ProjectOwner)
                        .Any(member =>
                            EF.Functions.Like(member.AppUser.FirstName + " " + member.AppUser.LastName, $"%{searchText.ToLower()}%")
                        )
                );
            }

            if (projectStatus != null)
            {
                query = query.Where(p => p.ProjectStatus == projectStatus);
            }


            if(startDate.HasValue && !endDate.HasValue)
            {
                query = query.Where(p => p.StartDate == startDate);
            }
            if(!startDate.HasValue && endDate.HasValue)
            {
                query = query.Where(p => p.EndDate == endDate);
            }
           if (startDate.HasValue && endDate.HasValue)
            {
                query = query.Where(p => p.StartDate >= startDate && p.EndDate <= endDate);
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

        [HttpDelete("DeleteProjectMember/{projectId}/{userId}")]
        public async Task<ActionResult> DeleteProjectMember(int projectId,int userId)
        {
            var projectMember = await _context.ProjectMembers.FirstOrDefaultAsync(member => member.ProjectId == projectId && member.AppUserId == userId);
            if(projectMember != null)
            {
                _context.ProjectMembers.Remove(projectMember);
                await _context.SaveChangesAsync();
                return Ok();
            }
                
            return NotFound();
        }

        [HttpPost("UpdateUsersProjectRole")]
        public async Task<ActionResult> UpdateUsersProjectRole(ProjectMemberDTO dto)
        {
            var projectMember = await _context.ProjectMembers.FirstOrDefaultAsync(member => member.ProjectId == dto.ProjectId && member.AppUserId == dto.AppUserId);
            if(projectMember != null)
            {
                projectMember.ProjectRole = dto.ProjectRole;
                await _context.SaveChangesAsync();
                return Ok();
            }
                
            return NotFound();
        }

        [HttpGet("GetProjectOwner/{projectId}")]
        public async Task<ActionResult<AppUser>> GetProjectOwner(int projectId)
        {
            var OwnerMember = await _context.ProjectMembers.FirstOrDefaultAsync(member => member.ProjectId == projectId && member.ProjectRole == ProjectRole.ProjectOwner);
            if(OwnerMember!=null)
            {
                var ProjectOwner = await _context.Users.FirstOrDefaultAsync(member => member.Id == OwnerMember.AppUserId);
                return Ok(ProjectOwner);
            }
            return null;
        }

        // Add this method to the ProjectsController class
        [HttpPut("archive/{projectId}")]
        public async Task<IActionResult> ArchiveProject(int projectId) {
            var project = await _context.Projects.FindAsync(projectId);
            if (project == null) {
                return NotFound("Project not found.");
            }

            project.ProjectStatus = ProjectStatus.Archived; // Assuming ProjectStatus.Archived enum is 3

            var tasks = await _context.ProjectTasks
                                    .Where(t => t.ProjectId == projectId)
                                    .ToListAsync();
            foreach (var task in tasks) {
                task.IsOriginProjectArchived = true;
            }
            _notificationService.ArchiveRelatedProjectNotifications(projectId);//~maksim
            await _context.SaveChangesAsync();
            return Ok(new { message = "Project and its tasks have been archived." });
        }
        
        [HttpGet("isArchived/{projectId}")] //api/projects/isArchived/2
        public async Task<ActionResult<bool>> IsProjectArchived(int projectId)
        {
            if(ProjectExists(projectId))
            {
                var project1= await _context.Projects.FirstOrDefaultAsync(proj=>proj.Id==projectId && proj.ProjectStatus==ProjectStatus.Archived);
                if(project1!=null){
                    return true; 
                }
                else return false; 
            }
            else return true; 
           
        }
    }
}

