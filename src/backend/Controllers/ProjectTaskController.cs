using backend.Data;
using backend.DTO;
using backend.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    // [Authorize]
    public class ProjectTaskController : BaseApiController
    {
        private readonly DataContext _context;

        public ProjectTaskController(DataContext context)
        {
            _context = context;
        }
        
        [AllowAnonymous]
        [HttpPost] // POST: api/projectTask/
        public async Task<ActionResult<ProjectTask>> CreateTask(ProjectTaskDto taskDto)
        {
            // if(!await RoleCheck(taskDto.AppUserId,taskDto.ProjectId))
            //     return Unauthorized("Invalid role");

            var task = new ProjectTask
            {
                TaskName = taskDto.TaskName,
                Description = taskDto.Description,
                StartDate = taskDto.StartDate,
                EndDate = taskDto.EndDate,
                ProjectId = taskDto.ProjectId,
                TskStatusId = _context.TaskStatuses
                        .Where(ts => ts.ProjectId == taskDto.ProjectId && ts.Position == 0)
                        .Select(ts => ts.Id)
                        .FirstOrDefault(),
                ProjectSectionId = taskDto.ProjectSectionId
            };

            _context.ProjectTasks.Add(task);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetProjectTask), new { id = task.Id }, taskDto);
        }
        
        [AllowAnonymous]
        [HttpGet] // GET: api/projectTask/
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetProjectTasks()
        {
            var tasks = await _context.ProjectTasks
                .Select(task => new
                {
                    task.Id, task.TaskName, task.Description, task.StartDate, task.EndDate,
                    task.ProjectId, task.TskStatus.StatusName, task.TskStatus.Color,
                    task.ProjectSection.SectionName
                })
                .ToListAsync();
            return Ok(tasks);
        }

        [AllowAnonymous]
        [HttpGet("{id}")] // GET: api/projectTask/2
        public async Task<ActionResult<ProjectTask>> GetProjectTask(int id)
        {
            var task = await _context.ProjectTasks
            .Select(task => new
            {
                task.Id, task.TaskName, task.Description, task.StartDate, task.EndDate,
                task.ProjectId, task.TskStatus.StatusName, task.TskStatus.Color,
                task.ProjectSection.SectionName
            })
            .FirstOrDefaultAsync(t => t.Id == id); // Use FirstOrDefaultAsync instead of ToListAsync

            if (task == null)
            {
                return NotFound();
            }
            return Ok(task);
        }
        
        [AllowAnonymous]
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

        [HttpPut("updateStatus/{id}")] // PUT: api/projectTask/updateStatus/5
        public async Task<ActionResult<ProjectTask>> UpdateTaskStatus(int id, ProjectTaskDto taskDto)
        {
            var task = await _context.ProjectTasks.FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound();
            }
            // task.TaskStatusId = taskDto.TaskStatusId;
            await _context.SaveChangesAsync();

            return Ok(task);
        }

        [AllowAnonymous]
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
            // if(dto.TaskStatus != null) task.TaskStatus = (Entities.TaskStatus)dto.TaskStatus;

            await _context.SaveChangesAsync();

            return Ok(task);
        }

        [AllowAnonymous]
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

        [AllowAnonymous]
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
        //komentar
            return Ok(taskDep);
        }

        [AllowAnonymous]
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

        [AllowAnonymous]
        [HttpGet("ByProject/{projectId}")] // New method to get tasks by project ID
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetTasksByProjectId(int projectId)
        {
            var tasks = await _context.ProjectTasks
                .Where(t => t.ProjectId == projectId)
                .Include(t => t.Project) // Include project details if needed
                .ToListAsync();
            return tasks;
        }

        // [HttpGet("statuses")] // GET: api/projectTask/statuses
        // public ActionResult<IEnumerable<object>> GetTaskStatuses()
        // {
        //     var statuses = Enum.GetValues(typeof(Entities.TaskStatus))
        //         .Cast<Entities.TaskStatus>()
        //         .Select(status => new { id = (int)status, name = status.ToString() })
        //         .ToList();

        //     return Ok(statuses);
        // }
    }
}

