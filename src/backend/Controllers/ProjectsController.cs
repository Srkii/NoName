using backend.Controllers;
using backend.Data;
using backend.DTO;
using backend.Entities;
using Microsoft.AspNetCore.Authorization;
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
            _context.Projects.Add(project);
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
        [HttpPut("{id}")] // PUT: api/projects/3
        public async Task<IActionResult> UpdateProject(int id, ProjectDto projectDto)
        {
            var project = await _context.Projects.FindAsync(id);
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
            catch (DbUpdateConcurrencyException) when (!ProjectExists(id))
            {
                return NotFound();
            }

            return NoContent();
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
        
    }


}

