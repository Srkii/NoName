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
                    task.ProjectSection.SectionName, task.AppUser
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
            .FirstOrDefaultAsync(t => t.Id == id);

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
                                      .Where(task => task.AppUserId == userId)
                                      .Select(task => new
                                      {
                                          task.Id, task.TaskName, task.Description, task.StartDate, task.EndDate,
                                          task.ProjectId, task.TskStatus.StatusName, task.TskStatus.Color,
                                          task.ProjectSection.SectionName
                                      })
                                      .ToListAsync();
            return Ok(tasks);
        }

        [HttpPut("updateTicoStatus/{id}")] // PUT: api/projectTask/updateStatus/5
        public async Task<ActionResult<ProjectTask>> UpdateTaskStatus(int id, ProjectTaskDto taskDto)
        {
            var task = await _context.ProjectTasks.FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound();
            }
            task.TskStatusId = taskDto.TaskStatusId;
            await _context.SaveChangesAsync();

            return Ok(task);
        }


        [HttpPut("updateStatus/{id}/{statusName}")]
        public async Task<ActionResult<ProjectTask>> UpdateTaskStatus(int id, string statusName)
        {
            var task = await _context.ProjectTasks.Include(t => t.TskStatus).FirstOrDefaultAsync(t => t.Id == id);

            if (task == null)
            {
                return NotFound();
            }

            var status = await _context.TaskStatuses.FirstOrDefaultAsync(s => s.StatusName == statusName && s.ProjectId == task.ProjectId);

            if (status == null)
            {
                return NotFound("Status not found.");
            }

            task.TskStatusId = status.Id;
            await _context.SaveChangesAsync();

            return Ok(task);
        }


        [AllowAnonymous]
        [HttpPut("changeTaskInfo")] // GET: api/projectTask/changeTaskInfo
        public async Task<ActionResult<ProjectTask>> changeTaskInfo(ChangeTaskInfoDto dto)
        {
            if (!await RoleCheck(dto.AppUserId, dto.ProjectId))
                return Unauthorized("Unvalid role");

            var task = await _context.ProjectTasks.FindAsync(dto.Id);

            if (task == null)
                return BadRequest("Task doesn't exists");

            if (dto.TaskName != null) task.TaskName = dto.TaskName;
            if (dto.Description != null && dto.Description != "") task.Description = dto.Description;
            // if(dto.TaskStatus != null) task.TaskStatus = (Entities.TaskStatus)dto.TaskStatus;

            await _context.SaveChangesAsync();

            return Ok(task);
        }

        [AllowAnonymous]
        [HttpPut("changeTaskSchedule")] // GET: api/projectTask/changeTaskSchedule
        public async Task<ActionResult<ProjectTask>> ChangeTaskSchedule(TaskScheduleDto dto)
        {
            if (!await RoleCheck(dto.AppUserId, dto.ProjectId))
                return Unauthorized("Unvalid role");

            var task = await _context.ProjectTasks.FindAsync(dto.Id);

            if (task == null)
                return BadRequest("Task doesn't exists");

            if (dto.StartDate != null) task.StartDate = (DateTime)dto.StartDate;
            if (dto.EndDate != null) task.EndDate = (DateTime)dto.EndDate;

            await _context.SaveChangesAsync();

            return Ok(task);
        }

        [AllowAnonymous]
        [HttpPut("addTaskDependency")] // GET: api/projectTask/addTaskDependency
        public async Task<ActionResult<ProjectTask>> AddTaskDependency(TaskDependencyDto dto)
        {
            if (!await RoleCheck(dto.AppUserId, dto.ProjectId))
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

        public async Task<ActionResult<ProjectTask>> AddTaskAssignee(int taskId, int userId, int projectId)
        {
            var isMember = await _context.ProjectMembers.AnyAsync(pm => pm.AppUserId == userId && pm.ProjectId == projectId);
            if (!isMember)
            {
                return BadRequest("User is not a member of the project");
            }
            if (!await RoleCheck(userId, projectId))
                return Unauthorized("Invalid role");

            var task = await _context.ProjectTasks.FindAsync(taskId);
            if (task == null)
                return NotFound("Task not found");

            task.AppUserId = userId;
            await _context.SaveChangesAsync();

            return Ok(task);
        }

        public async Task<bool> RoleCheck(int userId, int projectId)
        {
            var roles = new List<ProjectRole> { ProjectRole.ProjectOwner, ProjectRole.Manager };
            var projectMember = await _context.ProjectMembers.FirstOrDefaultAsync(x => x.AppUserId == userId && x.ProjectId == projectId && roles.Contains(x.ProjectRole));
            return projectMember != null;
        }

        [AllowAnonymous]
        [HttpGet("ByProject/{projectId}")]
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetTasksByProjectId(int projectId)
        {
            var tasks = await _context.ProjectTasks
                .Select(task => new
                {
                    task.Id, task.TaskName, task.Description, task.StartDate, task.EndDate,
                    task.ProjectId, task.TskStatus.StatusName, task.TskStatus.Color,
                    task.ProjectSection.SectionName, task.AppUser.FirstName, task.AppUser.LastName
                })
                .Where(t => t.ProjectId == projectId)
                .ToListAsync();
            return Ok(tasks);
        }

        [HttpGet("statuses/{projectId}")] // GET: api/projectTask/statuses/{projectId}
        public ActionResult<IEnumerable<object>> GetTaskStatuses(int projectId)
        {
            var statuses = _context.TaskStatuses
                .Where(status => status.ProjectId == projectId)
                .Select(status => new { id = status.Id, name = status.StatusName, position = status.Position, color = status.Color })
                .ToList();

            return Ok(statuses);
        }

        [HttpPut("updateStatusPositions")]
        public async Task<IActionResult> UpdateTaskStatusPositions([FromBody] List<TskStatus> updatedStatuses)
        {
            foreach (var status in updatedStatuses)
            {
                var dbStatus = await _context.TaskStatuses.FindAsync(status.Id);
                if (dbStatus != null)
                {
                    dbStatus.Position = status.Position;
                }
            }
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpPost("addTaskStatus")]
        public async Task<IActionResult> AddTaskStatus([FromBody] TaskStatusDto taskStatusDto)
        {
            if (await _context.TaskStatuses.AnyAsync(ts => ts.StatusName == taskStatusDto.StatusName && ts.ProjectId == taskStatusDto.ProjectId))
            {
                return BadRequest("A status with the same name already exists.");
            }

            var inReviewStatus = await _context.TaskStatuses.FirstOrDefaultAsync(ts => ts.StatusName == "InReview" && ts.ProjectId == taskStatusDto.ProjectId);
            var newPosition = inReviewStatus != null ? inReviewStatus.Position + 1 : 0; // Assuming positions are 0-indexed

            var newTaskStatus = new TskStatus
            {
                StatusName = taskStatusDto.StatusName,
                Position = newPosition,
                Color = taskStatusDto.Color,
                ProjectId = taskStatusDto.ProjectId
            };

            _context.TaskStatuses.Add(newTaskStatus);
            await _context.SaveChangesAsync();

            return Ok(newTaskStatus);
        }

    }
}

