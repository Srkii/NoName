﻿using backend.Data;
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
                // ProjectSectionId = taskDto.ProjectSectionId,
                DateCreated = DateTime.Now, // postavlja vreme i datum kad je task kreiran
                AppUserId = taskDto.AppUserId
            };

            _context.ProjectTasks.Add(task);
            await _context.SaveChangesAsync();

            return Ok(task);
        }

        [AllowAnonymous]
        [HttpGet] // GET: api/projectTask/
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetProjectTasks()
        {
            var tasks = await _context.ProjectTasks
                .Select(task => new
                {
                    task.Id,
                    task.TaskName,
                    task.Description,
                    task.StartDate,
                    task.EndDate,
                    task.ProjectId,
                    task.TskStatus.StatusName,
                    task.TskStatus.Color,
                    task.ProjectSection.SectionName,
                    task.AppUser
                })
                .ToListAsync();
            return Ok(tasks);
        }

        [AllowAnonymous]
        [HttpGet("{task_id}/{userId}")] // GET: api/projectTask/2
        public async Task<ActionResult<ProjectTask>> GetProjectTask(int task_id,int userId)
        {
            var task = await _context.ProjectTasks
            .Select(task => new
            {
                task.Id,
                task.TaskName,
                task.Description,
                task.StartDate,
                task.EndDate,
                task.ProjectId,
                task.TskStatus.StatusName,
                task.TskStatus.Color,
                task.ProjectSection.SectionName,
                task.Project,
                 ProjectRole = _context.ProjectMembers
                                        .Where(member => member.AppUserId == userId && member.ProjectId == task.ProjectId)
                                        .Select(member => member.ProjectRole)
                                        .FirstOrDefault()
            })
            .FirstOrDefaultAsync(t => t.Id == task_id);

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
                                          task.Id,
                                          task.TaskName,
                                          task.Description,
                                          task.StartDate,
                                          task.EndDate,
                                          task.ProjectId,
                                          task.TskStatus.StatusName,
                                          task.TskStatus.Color,
                                          task.ProjectSection.SectionName,
                                          task.Project,
                                        ProjectRole = _context.ProjectMembers
                                        .Where(member => member.AppUserId == userId && member.ProjectId == task.ProjectId)
                                        .Select(member => member.ProjectRole)
                                        .FirstOrDefault()
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


        [HttpPut("updateStatus/{taskId}/{statusName}")]
        public async Task<ActionResult<ProjectTaskDto>> UpdateTaskStatus1(int taskId, string statusName)
        {
            var task = await _context.ProjectTasks
                .Include(t => t.TskStatus)
                .FirstOrDefaultAsync(t => t.Id == taskId);

            if (task == null)
            {
                return NotFound();
            }

            var status = await _context.TaskStatuses
                .FirstOrDefaultAsync(s => s.StatusName == statusName && s.ProjectId == task.ProjectId);

            if (status == null)
            {
                return NotFound("Status not found.");
            }

            task.TskStatusId = status.Id;
            await _context.SaveChangesAsync();

            // Now, after saving changes, fetch the updated task again
            task = await _context.ProjectTasks
                .Include(t => t.TskStatus)
                .FirstOrDefaultAsync(t => t.Id == taskId);

            // Create a DTO to shape the response
            var taskDto = new ProjectTaskDto
            {
                Id = task.Id,
                // Add other properties you want to include in the DTO
            };

            return taskDto;
        }

        [AllowAnonymous]
        [HttpPut("changeTaskInfo")] // GET: api/projectTask/changeTaskInfo
        public async Task<ActionResult<ProjectTask>> changeTaskInfo(ChangeTaskInfoDto dto)
        {
            // if (!await RoleCheck(dto.AppUserId, dto.ProjectId))
            //     return Unauthorized("Unvalid role");

            var task = await _context.ProjectTasks.FindAsync(dto.Id);

            if (task == null)
                return BadRequest("Task doesn't exists");

            if (dto.TaskName != null) task.TaskName = dto.TaskName;
            if (dto.Description != null && dto.Description != "") task.Description = dto.Description;
            if (dto.DueDate != null) task.EndDate = (DateTime)dto.DueDate;
            if (dto.ProjectId!=0) task.ProjectId = dto.ProjectId;
            if (dto.AppUserId!=0) task.AppUserId = dto.AppUserId;

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

        [AllowAnonymous]
        [HttpPost("AddTaskAssignee")]
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

        [AllowAnonymous]
        [HttpGet("RoleCheck")]
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
                    task.Id,
                    task.TaskName,
                    task.Description,
                    task.StartDate,
                    task.EndDate,
                    task.ProjectId,
                    task.TskStatus.StatusName,
                    task.TskStatus.Color,
                    task.ProjectSection.SectionName,
                    task.AppUser.FirstName,
                    task.AppUser.LastName,
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
            var CompletedStatus = await _context.TaskStatuses.FirstOrDefaultAsync(ts => ts.StatusName == "Completed" && ts.ProjectId == taskStatusDto.ProjectId);
            var ArchivedStatus = await _context.TaskStatuses.FirstOrDefaultAsync(ts => ts.StatusName == "Archived" && ts.ProjectId == taskStatusDto.ProjectId);
            var newPosition = inReviewStatus != null ? inReviewStatus.Position : 0; // Assuming positions are 0-indexed
            
            if (inReviewStatus != null) inReviewStatus.Position += 1;
            if (CompletedStatus != null) CompletedStatus.Position += 1;
            if (ArchivedStatus != null) ArchivedStatus.Position += 1;

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

        [AllowAnonymous]
        [HttpGet("sortTasksByDueDate/{userId}")]
        public async Task<ActionResult<IEnumerable<object>>> SortTasksByDueDate(int userId,string sortOrder)
        {
            var query = _context.ProjectTasks.AsQueryable();
            // Apply sorting based on the sortBy parameter
            switch (sortOrder)
            {
                case "asc":
                    query = query.OrderBy(task => task.EndDate);
                    break;
                // Add more cases for additional sorting criteria if needed
                case "desc":
                    // Default sorting by task ID if sortBy parameter is not recognized
                    query = query.OrderByDescending(task => task.EndDate);
                    break;
            }

            var sortedTasks = await query.Where(task => task.AppUserId == userId && task.TskStatusId==task.TskStatus.Id && task.TskStatus.StatusName=="InReview")
                .Select(task => new
                {
                    task.Id,
                    task.TaskName,
                    task.Description,
                    task.StartDate,
                    task.EndDate,
                    task.ProjectId,
                    task.TskStatus.StatusName,
                    task.TskStatus.Color,
                    task.ProjectSection.SectionName,
                    task.AppUser.FirstName,
                    task.AppUser.LastName,
                    task.Project
                    
                })
                .ToListAsync();
            return sortedTasks;
        }

        [HttpDelete("deleteTaskStatus/{TaskStatusId}")] // GET: api/projectTask/deleteTaskStatus/{TaskStatusId}
        public async Task<IActionResult> DeleteSection(int TaskStatusId)
        {
            var statusToDelete = await _context.TaskStatuses.FindAsync(TaskStatusId);
            if (statusToDelete == null)
            {
                return NotFound("Section not found.");
            }

            var proposedStatus = await _context.TaskStatuses.FirstOrDefaultAsync(ts => ts.StatusName == "Proposed" && ts.ProjectId == statusToDelete.ProjectId);
            if (proposedStatus == null)
            {
                return NotFound("Proposed status not found in the project.");
            }

            var tasksToUpdate = await _context.ProjectTasks.Where(t => t.TskStatusId == TaskStatusId).ToListAsync();
            foreach (var task in tasksToUpdate)
            {
                task.TskStatusId = proposedStatus.Id;
            }

            // brisanje TskStatus (section)
            _context.TaskStatuses.Remove(statusToDelete);
            await _context.SaveChangesAsync();

            // sortiranje preostalih statusa
            var remainingStatuses = await _context.TaskStatuses
                .Where(ts => ts.ProjectId == statusToDelete.ProjectId)
                .OrderBy(ts => ts.StatusName == "Proposed" ? 0 : ts.StatusName == "InProgress" ? 1 : ts.StatusName == "InReview" ? int.MaxValue - 2 : ts.StatusName == "Completed" ? int.MaxValue - 1 : ts.StatusName == "Archived" ? int.MaxValue : 2)
                .ToListAsync();

            for (int i = 0; i < remainingStatuses.Count; i++)
            {
                remainingStatuses[i].Position = i;
            }
            await _context.SaveChangesAsync();

            return Ok(new { message = "Section deleted and tasks updated to Proposed status." });
        }
        [AllowAnonymous]
        [HttpGet("user/{userId}/count1/{count}")]
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetNewTasksByUserId(int userId, int count)
        {
            var tasks = await _context.ProjectTasks
                .Where(task => task.AppUserId == userId && task.TskStatusId==task.TskStatus.Id && task.TskStatus.StatusName!="InReview" 
                && task.TskStatus.StatusName!="Completed" && task.TskStatus.StatusName!="Archived")
                .Take(count)
                .OrderByDescending(task => task.DateCreated) // Order by DateCreated in descending order
                .Select(task => new
                {
                    task.Id,
                    task.TaskName,
                    task.Description,
                    task.StartDate,
                    task.EndDate,
                    task.ProjectId,
                    task.TskStatus.StatusName,
                    task.TskStatus.Color,
                    task.ProjectSection.SectionName,
                    task.Project,
                    ProjectRole = _context.ProjectMembers
                        .Where(member => member.AppUserId == userId && member.ProjectId == task.ProjectId)
                        .Select(member => member.ProjectRole)
                        .FirstOrDefault()
                })
                .ToListAsync();
            

            return Ok(tasks);
        }
        [AllowAnonymous]
        [HttpGet("user/{userId}/count2/{count}")]
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetSoonTasksByUserId(int userId, int count)
        {
            var tasks = await _context.ProjectTasks
                .Where(task => task.AppUserId == userId && task.TskStatusId==task.TskStatus.Id && task.TskStatus.StatusName!="InReview" 
                && task.TskStatus.StatusName!="Completed" && task.TskStatus.StatusName!="Archived")
                .Take(count)
                .OrderByDescending(task => DateTime.Compare(task.EndDate, DateTime.Now))
                .Select(task => new
                {
                    task.Id,
                    task.TaskName,
                    task.Description,
                    task.StartDate,
                    task.EndDate,
                    task.ProjectId,
                    task.TskStatus.StatusName,
                    task.TskStatus.Color,
                    task.ProjectSection.SectionName,
                    task.Project,
                    ProjectRole = _context.ProjectMembers
                        .Where(member => member.AppUserId == userId && member.ProjectId == task.ProjectId)
                        .Select(member => member.ProjectRole)
                        .FirstOrDefault()
                })
                .ToListAsync();
            

            return Ok(tasks);
        }
        [AllowAnonymous]
        [HttpGet("user/{userId}/count3/{count}")]
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetClosedTasksByUserId(int userId, int count)
        {
            var tasks = await _context.ProjectTasks
                .Where(task => task.AppUserId == userId && task.TskStatusId==task.TskStatus.Id && task.TskStatus.StatusName=="InReview")
                .Take(count)
                .Select(task => new
                {
                    task.Id,
                    task.TaskName,
                    task.Description,
                    task.StartDate,
                    task.EndDate,
                    task.ProjectId,
                    task.TskStatus.StatusName,
                    task.TskStatus.Color,
                    task.ProjectSection.SectionName,
                    task.Project,
                    ProjectRole = _context.ProjectMembers
                        .Where(member => member.AppUserId == userId && member.ProjectId == task.ProjectId)
                        .Select(member => member.ProjectRole)
                        .FirstOrDefault()
                })
                .ToListAsync();
            

            return Ok(tasks);
        }
    }


}

