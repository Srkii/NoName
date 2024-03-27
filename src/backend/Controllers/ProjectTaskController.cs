using backend.Data;
using backend.DTO;
using backend.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/projectTask")]
    public class ProjectTaskController : ControllerBase
    {
        private readonly DataContext _context;

        public ProjectTaskController(DataContext context)
        {
            _context = context;
        }
        
        [Authorize]
        [HttpPost] // POST: api/projectTask/
        public async Task<ActionResult<ProjectTask>> CreateTask(ProjectTaskDto taskDto)
        {
            if(!await RoleCheck(taskDto.AppUserId,taskDto.ProjectId))
                return Unauthorized("Unvalid role");

            var task = new ProjectTask
            {
                TaskName = taskDto.TaskName,
                Description = taskDto.Description,
                StartDate = taskDto.StartDate,
                EndDate = taskDto.EndDate,
                TaskStatus = taskDto.TaskStatus,
                ProjectId = taskDto.ProjectId,
            };

            _context.ProjectTasks.Add(task);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProjectTask), new { id = task.Id }, taskDto);
        }
        
        [Authorize]
        [HttpGet] // GET: api/projectTask/
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetProjectTasks()
        {
            var tasks = await _context.ProjectTasks
                .Include(task => task.Project)
                .ToListAsync();
            return tasks;
        }

        [Authorize]
        [HttpGet("{id}")] // GET: api/projectTask/2
        public async Task<ActionResult<ProjectTask>> GetProjectTask(int id)
        {
            var tasklist = await _context.ProjectTasks
              .Include(task => task.Project).Where(t => t.Id == id).ToListAsync();

            if (tasklist == null)
            {
                return NotFound();
            }
            return tasklist[0];
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetTasksByUserId(int userId)
        {
            var tasks = await _context.ProjectTasks
                                      .Include(task => task.Project)
                                      .Join(_context.TaskMembers,
                                            task => task.Id,
                                            member => member.TaskId,
                                            (task, member) => new { task, member })
                                      .Where(tm => tm.member.AppUserId == userId)
                                      .Select(tm => tm.task) // Change this line
                                      .ToListAsync();
            return tasks;
        }

        [Authorize]
        [HttpPut("changeTaskInfo")] // GET: api/projectTask/changeTaskInfo
        public async Task<ActionResult<ProjectTask>> changeTaskInfo(ChangeTaskInfoDto dto)
        {
            if(!await RoleCheck(dto.AppUserId,dto.ProjectId))
                return Unauthorized("Unvalid role");

            var task = await _context.ProjectTasks.FindAsync(dto.Id);

            if(task == null)
                return BadRequest("Task doesn't exists");
            
            if(dto.TaskName != null) task.TaskName = dto.TaskName;
            if(dto.Description != null && dto.Description != "") task.Description = dto.Description;
            if(dto.TaskStatus != null) task.TaskStatus = (Entities.TaskStatus)dto.TaskStatus;

            await _context.SaveChangesAsync();

            return Ok(task);
        }

        [Authorize]
        [HttpPut("changeTaskSchedule")] // GET: api/projectTask/changeTaskSchedule
        public async Task<ActionResult<ProjectTask>> ChangeTaskSchedule(TaskScheduleDto dto)
        {
            if(!await RoleCheck(dto.AppUserId,dto.ProjectId))
                return Unauthorized("Unvalid role");

            var task = await _context.ProjectTasks.FindAsync(dto.Id);

            if(task == null)
                return BadRequest("Task doesn't exists");
            
            if(dto.StartDate != null) task.StartDate = (DateTime)dto.StartDate;
            if(dto.EndDate != null) task.EndDate = (DateTime)dto.EndDate;

            await _context.SaveChangesAsync();

            return Ok(task);
        }

        [Authorize]
        [HttpPut("addTaskDependency")] // GET: api/projectTask/addTaskDependency
        public async Task<ActionResult<ProjectTask>> AddTaskDependency(TaskDependencyDto dto)
        {
            if(!await RoleCheck(dto.AppUserId,dto.ProjectId))
                return Unauthorized("Unvalid role");

            var taskDep = new TaskDependency
            {
                TaskId = dto.TaskId,
                DependencyTaskId = dto.DependencyTaskId
            };

            await _context.TaskDependencies.AddAsync(taskDep);
            await _context.SaveChangesAsync();

            return Ok(taskDep);
        }

        [Authorize]
        [HttpPut("addTaskAssignee")] // GET: api/projectTask/addTaskAssignee
        public async Task<ActionResult<ProjectTask>> AddTaskAssignee(TaskMember data)
        {
            if(!await RoleCheck(data.AppUserId,data.ProjectId))
                return Unauthorized("Unvalid role");

            await _context.TaskMembers.AddAsync(data);
            await _context.SaveChangesAsync();

            return Ok(data);
        }

        public async Task<bool> RoleCheck(int userId,int projectId)
        {
            var roles = new List<ProjectRole>{ProjectRole.ProjectOwner,ProjectRole.Manager};
            var projectMember = await _context.ProjectMembers.FirstOrDefaultAsync(x => x.AppUserId == userId && x.ProjectId == projectId && roles.Contains(x.ProjectRole));
            return projectMember != null;
        }
    }
}
