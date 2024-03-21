using backend.Data;
using backend.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Controllers
{
    [ApiController] // Add ApiController attribute
    [Route("api/projectTask")]
    public class ProjectTaskController : ControllerBase
    {
        private readonly DataContext _context;

        public ProjectTaskController(DataContext context)
        {
            _context = context;
        }

        [HttpPost] // POST: api/projectTask/
        public async Task<ActionResult<ProjectTaskDto>> CreateTask(ProjectTaskDto taskDto)
        {
            var task = new ProjectTask
            {
                TaskName = taskDto.TaskName,
                Description = taskDto.Description,
                StartDate = taskDto.StartDate,
                EndDate = taskDto.EndDate,
                TaskStatus = taskDto.TaskStatus,
                ProjectId = taskDto.ProjectId,
                // Avoid assigning the whole project object, just assign the ID
                // Project = taskDto.Project,
            };

            _context.ProjectTasks.Add(task);
            await _context.SaveChangesAsync();

            // Return 201 Created status with the created task DTO
            return CreatedAtAction(nameof(GetProjectTask), new { id = task.Id }, taskDto);
        }

        [HttpGet] // GET: api/projectTask/
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetProjectTasks()
        {
            var tasks = await _context.ProjectTasks
                .Include(task => task.Project) // Include the associated project data
                .ToListAsync();
            return tasks;
        }


        [HttpGet("{id}")] // GET: api/projectTask/2
        public async Task<ActionResult<ProjectTask>> GetProjectTask(int id)
        {
            var task = await _context.ProjectTasks.FindAsync(id);
            if (task == null)
            {
                return NotFound();
            }
            return task;
        }
    }
}
