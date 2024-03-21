using backend.Controllers;
using backend.Data;
using backend.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend
{
    public class ProjectsController : BaseApiController
    {
        private readonly DataContext context;
        public ProjectsController(DataContext context)
        {
            this.context = context;
        }

        [HttpPost] // POST: api/projects/
        public async Task<ActionResult<ProjectDto>> CreateProject(ProjectDto projectDto)
        {
            var project = new Project
            {
                ProjectName = projectDto.ProjectName,
                ParentId = projectDto.ParentId,
                Description = projectDto.Description,
                StartDate = projectDto.StartDate,
                EndDate = projectDto.EndDate,
                ProjectStatus = projectDto.ProjectStatus,
                Priority = projectDto.Priority
            };
            context.Projects.Add(project);
            await context.SaveChangesAsync();
            return new ProjectDto
            {
                ProjectName = project.ProjectName,
                Description = project.Description,
                StartDate = project.StartDate,
                EndDate = project.EndDate,
                ProjectStatus = project.ProjectStatus,
                Priority = project.Priority
            };
        }

        [HttpGet] // GET: api/projects/
        public async Task<ActionResult<IEnumerable<Project>>> GetProjects()
        {
            var projects = await context.Projects.ToListAsync();
            return projects;
        }

        [HttpGet("{id}")] // GET: api/projects/2
        public async Task<ActionResult<Project>> GetProject(int id)
        {
            return await context.Projects.FindAsync(id);
        }

        [HttpPut("{id}")] // PUT: api/projects/3
        public async Task<IActionResult> UpdateProject(int id, ProjectDto projectDto)
        {
            var project = await context.Projects.FindAsync(id);
            if (project == null)
            {
                return NotFound();
            }

            project.ProjectName = projectDto.ProjectName;
            project.ParentId = projectDto.ParentId;
            project.Description = projectDto.Description;
            project.StartDate = projectDto.StartDate;
            project.EndDate = projectDto.EndDate;
            project.ProjectStatus = projectDto.ProjectStatus;
            project.Priority = projectDto.Priority;

            try
            {
                await context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException) when (!ProjectExists(id))
            {
                return NotFound();
            }

            return NoContent();
        }

        private bool ProjectExists(int id)
        {
            return context.Projects.Any(e => e.Id == id);
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
    }


}

