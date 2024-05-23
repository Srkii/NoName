using System.IdentityModel.Tokens.Jwt;
using backend.Data;
using backend.DTO;
using backend.Entities;
using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;


namespace backend.Controllers
{
    // [Authorize]
    public class ProjectTaskController : BaseApiController
    {
        private readonly DataContext _context;
        private readonly INotificationService _notificationService;

        public ProjectTaskController(DataContext context,INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpPost] // POST: api/projectTask/
        public async Task<ActionResult<ProjectTask>> CreateTask(ProjectTaskDto taskDto)
        {
            if(!await RoleCheck(taskDto.ProjectId,[ProjectRole.ProjectManager,ProjectRole.ProjectOwner, ProjectRole.Manager]))
                return Unauthorized("Invalid role");

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
                AppUserId = taskDto.AppUserId,
                ProjectSectionId=taskDto.ProjectSectionId!=0 ? taskDto.ProjectSectionId : null,
            };

            await _context.ProjectTasks.AddAsync(task);
            await _context.SaveChangesAsync();
            await updateProgress(task.ProjectId);
            // ne obavestavamo sami sebe vise o kreaciji task-a
            if(taskDto.CreatorId!=taskDto.AppUserId){
                await _notificationService.TriggerTaskNotification(task.Id,taskDto.CreatorId); 
            }
            return Ok(task);
        }

        [Authorize(Roles = "ProjectManager,Member")]
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

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpGet("{task_id}/{userId}")] // GET: api/projectTask/2
        public async Task<ActionResult<ProjectTask>> GetProjectTask(int task_id,int userId)
        {
            var task = await _context.ProjectTasks
            .Include(t=>t.AppUser)
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
                AppUser=task.AppUser,
                ProjectSection=task.ProjectSection,
                Dependencies = _context.TaskDependencies.Where(dependency => dependency.TaskId == task.Id).Select(dependency=>dependency.DependencyTaskId).ToList(),
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

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetTasksByUserId(int userId)
        {
            var tasks = await _context.ProjectTasks
                                      .Where(task => task.AppUserId == userId && !task.IsOriginProjectArchived)
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
                                           AppUser = _context.Users.FirstOrDefault(u => u.Id == task.AppUserId),
                                           Dependencies = _context.TaskDependencies.Where(dependency => dependency.TaskId == task.Id).Select(dependency=>dependency.DependencyTaskId).ToList(),
                                        ProjectRole = _context.ProjectMembers
                                        .Where(member => member.AppUserId == userId && member.ProjectId == task.ProjectId)
                                        .Select(member => member.ProjectRole)
                                        .FirstOrDefault()
                                    })
                                      .ToListAsync();
            return Ok(tasks);
        }

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpPut("updateTicoStatus/{id}")] // PUT: api/projectTask/updateStatus/5
        public async Task<ActionResult<ProjectTask>> UpdateTaskStatus(int id, ProjectTaskDto taskDto)
        {
            if(!await RoleCheck(taskDto.ProjectId,[ProjectRole.ProjectManager,ProjectRole.ProjectOwner, ProjectRole.Manager, ProjectRole.Participant]))
                return Unauthorized("Invalid role");

            var task = await _context.ProjectTasks.FirstOrDefaultAsync(t => t.Id == id);
            bool wasArchived = false;
            if(task.TskStatus.StatusName.Equals("Archived")){
                wasArchived = true;
            }
            if (task == null)
            {
                return NotFound();
            }
            task.TskStatusId = taskDto.TaskStatusId;
            var statusName = await _context.TaskStatuses.FirstOrDefaultAsync(x=>x.Id == taskDto.TaskStatusId);
            if(statusName.Equals("Archived")){
                _notificationService.ArchiveRelatedTaskNotifications(taskDto.Id);//ukoliko ga sad renameujemo u archived onda ide ovo
            }else if(wasArchived){
                _notificationService.DeArchiveRelatedTaskNotifications(taskDto.Id);//ako je bio arhiviran , onda se sigurno dearhivira...
            }
            await _context.SaveChangesAsync();
            await updateProgress(task.ProjectId);

            return Ok(task);
        }

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpPut("updateStatus/{taskId}/{statusName}")]
        public async Task<ActionResult<ProjectTaskDto>> UpdateTaskStatus1(int taskId, string statusName)
        {
            var task = await _context.ProjectTasks
                .Include(t => t.TskStatus)
                .FirstOrDefaultAsync(t => t.Id == taskId);
            bool wasArchived = false;
            if(task.TskStatus.StatusName.Equals("Archived")){
                wasArchived = true;
            }
            if (task == null)
            {
                return NotFound();
            }

            if(!await RoleCheck(task.ProjectId,[ProjectRole.ProjectManager,ProjectRole.ProjectOwner, ProjectRole.Manager, ProjectRole.Participant]))
                return Unauthorized("Invalid role");

            var status = await _context.TaskStatuses
                .FirstOrDefaultAsync(s => s.StatusName == statusName && s.ProjectId == task.ProjectId);

            if (status == null)
            {
                return NotFound("Status not found.");
            }

            task.TskStatusId = status.Id;

            await _context.SaveChangesAsync();
            if(statusName.Equals("Archived")){
                _notificationService.ArchiveRelatedTaskNotifications(taskId);
            }else if(wasArchived){
                _notificationService.DeArchiveRelatedTaskNotifications(taskId);
            }
            if(statusName.Equals("InReview")){
                await _notificationService.notifyTaskCompleted(taskId);
            }   

            // Now, after saving changes, fetch the updated task again
            task = await _context.ProjectTasks
                .Include(t => t.TskStatus)
                .FirstOrDefaultAsync(t => t.Id == taskId);

            // Create a DTO to shape the response
            var taskDto = new ProjectTaskDto
            {
                Id = task.Id,
                TaskName = task.TaskName,
                Description = task.Description,
                StartDate = task.StartDate,
                EndDate = task.EndDate,
                TaskStatusId = task.TskStatusId,
                AppUserId = (int)task.AppUserId,
                ProjectId = task.ProjectId,
                ProjectSectionId = task.ProjectSectionId
                
            };
            
            await updateProgress(task.ProjectId);

            return taskDto;
        }

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpPut("changeTaskInfo")] // GET: api/projectTask/changeTaskInfo
        public async Task<ActionResult<ProjectTask>> changeTaskInfo(ChangeTaskInfoDto dto)
        {
            var task = await _context.ProjectTasks.FindAsync(dto.Id);

            if (task == null)
                return BadRequest("Task doesn't exists");
            
            if(task.StartDate > dto.DueDate)
                return BadRequest("Start date must be <= end date");

            if(!await RoleCheck(task.ProjectId,[ProjectRole.ProjectManager,ProjectRole.ProjectOwner,ProjectRole.Manager]))
                return Unauthorized("Invalid role");
            
            if (dto.TaskName != null) task.TaskName = dto.TaskName;
            if (dto.Description != null && dto.Description != "") task.Description = dto.Description;
            if (dto.DueDate != null) task.EndDate = (DateTime)dto.DueDate;
            if (dto.ProjectId!=0) task.ProjectId = dto.ProjectId;
            if (dto.AppUserId!=0) task.AppUserId = dto.AppUserId;
            if(dto.SectionId!=0) task.ProjectSectionId=dto.SectionId;
            if(dto.SectionId==0) task.ProjectSectionId=null;    

            await _context.SaveChangesAsync();

            return task;
        }

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpPut("changeTaskSchedule")] // GET: api/projectTask/changeTaskSchedule
        public async Task<ActionResult<ProjectTask>> ChangeTaskSchedule(TaskScheduleDto dto)
        {
            var task = await _context.ProjectTasks.FindAsync(dto.Id);

            if (task == null)
                return BadRequest("Task doesn't exists");
            
            if(!await RoleCheck(task.ProjectId,[ProjectRole.ProjectManager,ProjectRole.ProjectOwner]))
                return Unauthorized("Invalid role");

            if (dto.StartDate != null) task.StartDate = (DateTime)dto.StartDate;
            if (dto.EndDate != null) task.EndDate = (DateTime)dto.EndDate;

            await _context.SaveChangesAsync();

            return Ok(task);
        }

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpPost("addTaskDependency")] // GET: api/projectTask/addTaskDependency
        public async Task<ActionResult<TaskDependency>> AddTaskDependency(List<TaskDependencyDto> dtos)
        {
            var test = await _context.ProjectTasks.FirstOrDefaultAsync(x => x.Id == dtos[0].TaskId);

            if(!await RoleCheck(test.ProjectId,[ProjectRole.ProjectManager,ProjectRole.ProjectOwner, ProjectRole.Manager]))
                return Unauthorized("Invalid role");

            foreach (var dto in dtos)
            {
                var existingDependency = await _context.TaskDependencies
                .AnyAsync(dep => dep.TaskId == dto.TaskId && dep.DependencyTaskId == dto.DependencyTaskId);

                if (existingDependency)
                {
                    // If the dependency already exists, update it
                    var existing = await _context.TaskDependencies.FirstOrDefaultAsync(dep => dep.TaskId == dto.TaskId);
                    existing.TaskId = dto.TaskId;
                    existing.DependencyTaskId = dto.DependencyTaskId;
                }
                else
                {
                    // If the dependency doesn't exist, add a new one
                    var newDependency = new TaskDependency
                    {
                        TaskId = dto.TaskId,
                        DependencyTaskId = dto.DependencyTaskId
                    };

                    _context.TaskDependencies.Add(newDependency);
                }

                await _context.SaveChangesAsync();
            }
            //komentar
            return Ok(); // Return success
        }

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpPost("deleteTaskDependency")] // POST: api/projectTask/deleteTaskDependency
        public async Task<ActionResult> DeleteTaskDependency(TaskDependencyDto dto)
        {
            var test = await _context.ProjectTasks.FirstOrDefaultAsync(x => x.Id == dto.TaskId);

            if(!await RoleCheck(test.ProjectId,[ProjectRole.ProjectManager,ProjectRole.ProjectOwner, ProjectRole.Manager]))
                return Unauthorized("Invalid role");

            // Find the task dependency to delete
            var dependencyToDelete = await _context.TaskDependencies
                .FirstOrDefaultAsync(dep => dep.TaskId == dto.TaskId && dep.DependencyTaskId == dto.DependencyTaskId);

            if (dependencyToDelete != null)
            {
                // If the dependency exists, remove it from the context
                _context.TaskDependencies.Remove(dependencyToDelete);
                await _context.SaveChangesAsync();
                return Ok(); // Return success
            }
            else
            {
                return NotFound(); // Return not found if the dependency doesn't exist
            }

        }

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpGet("getAllTasksDependencies")]
        public async Task<ActionResult<IEnumerable<TaskDependency>>> GetAllTasksDependencies()
        {
            var tasks = await _context.TaskDependencies.ToListAsync();
            return Ok(tasks);
        }

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpGet("getTaskDependencies/{id}")]
        public async Task<ActionResult<IEnumerable<TaskDependency>>> GetTaskDependencies(int id){
            return await _context.TaskDependencies.Where(x => x.TaskId == id).ToListAsync();
        }

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpPost("AddTaskAssignee")]
        public async Task<ActionResult<ProjectTask>> AddTaskAssignee(int taskId, int userId, int projectId)
        {
            if(!await RoleCheck(projectId,[ProjectRole.ProjectManager,ProjectRole.ProjectOwner, ProjectRole.Manager]))
                return Unauthorized("Invalid role");

            var isMember = await _context.ProjectMembers.AnyAsync(pm => pm.AppUserId == userId && pm.ProjectId == projectId);
            if (!isMember)
            {
                return BadRequest("User is not a member of the project");
            }

            var task = await _context.ProjectTasks.FindAsync(taskId);
            if (task == null)
                return NotFound("Task not found");

            task.AppUserId = userId;
            await _context.SaveChangesAsync();

            return Ok(task);
        }

        [Authorize(Roles = "ProjectManager,Member")]
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
                    task.AppUser.ProfilePicUrl,
                    task.ProjectSectionId
                })
                .Where(t => t.ProjectId == projectId)
                .ToListAsync();
            return Ok(tasks);
        }

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpGet("statuses/{projectId}")] // GET: api/projectTask/statuses/{projectId}
        public ActionResult<IEnumerable<object>> GetTaskStatuses(int projectId)
        {
            var statuses = _context.TaskStatuses
                .Where(status => status.ProjectId == projectId)
                .Select(status => new { id = status.Id, name = status.StatusName, position = status.Position, color = status.Color })
                .ToList();

            return Ok(statuses);
        }

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpPut("updateStatusPositions")]
        public async Task<IActionResult> UpdateTaskStatusPositions([FromBody] List<TskStatus> updatedStatuses)
        {
            if(updatedStatuses.Count == 0)
                return BadRequest("No task status positions to update");

            int projectId = updatedStatuses[0].ProjectId; // Extract projectId from the first status

            if(!await RoleCheck(projectId, new List<ProjectRole> { ProjectRole.ProjectManager, ProjectRole.ProjectOwner, ProjectRole.Manager }))
                return Unauthorized("Invalid role");

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

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpPost("addTaskStatus")]
        public async Task<IActionResult> AddTaskStatus([FromBody] TaskStatusDto taskStatusDto)
        {
            if(!await RoleCheck(taskStatusDto.ProjectId,[ProjectRole.ProjectManager,ProjectRole.ProjectOwner,ProjectRole.Manager]))
                return Unauthorized("Invalid role");

            if (await _context.TaskStatuses.AnyAsync(ts => ts.StatusName == taskStatusDto.StatusName && ts.ProjectId == taskStatusDto.ProjectId))
            {
                return BadRequest("A board with the same name already exists.");
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

        [Authorize(Roles = "ProjectManager,Member")]
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

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpDelete("deleteTaskStatus/{TaskStatusId}")] // GET: api/projectTask/deleteTaskStatus/{TaskStatusId}
        public async Task<IActionResult> DeleteSection(int TaskStatusId)
        {
            var statusToDelete = await _context.TaskStatuses.FindAsync(TaskStatusId);
            if (statusToDelete == null)
            {
                return NotFound("Section not found.");
            }

            if(!await RoleCheck(statusToDelete.ProjectId,[ProjectRole.ProjectManager,ProjectRole.ProjectOwner,ProjectRole.Manager]))
                return Unauthorized("Invalid role");

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

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpGet("user/{userId}/count1/{count}")]
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetNewTasksByUserId(int userId, int count)
        {
            var tasks = await _context.ProjectTasks
                .Where(task => task.AppUserId == userId && task.TskStatusId==task.TskStatus.Id && task.TskStatus.StatusName!="InReview" 
                && task.TskStatus.StatusName!="Completed" && task.TskStatus.StatusName!="Archived" && !task.IsOriginProjectArchived)
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
                    AppUser = _context.Users.FirstOrDefault(u => u.Id == task.AppUserId),
                    ProjectRole = _context.ProjectMembers
                        .Where(member => member.AppUserId == userId && member.ProjectId == task.ProjectId)
                        .Select(member => member.ProjectRole)
                        .FirstOrDefault()
                })
                .ToListAsync();
            

            return Ok(tasks);
        }

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpGet("user/{userId}/count2/{count}")]
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetSoonTasksByUserId(int userId, int count)
        {
            var tasks = await _context.ProjectTasks
                .Where(task => task.AppUserId == userId && task.TskStatusId==task.TskStatus.Id && task.TskStatus.StatusName!="InReview" 
                && task.TskStatus.StatusName!="Completed" && task.TskStatus.StatusName!="Archived" && !task.IsOriginProjectArchived)
                .Take(count)
                .OrderBy(task => task.EndDate) // Order by DateCreated in descending order
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
                    AppUser = _context.Users.FirstOrDefault(u => u.Id == task.AppUserId),
                    ProjectRole = _context.ProjectMembers
                        .Where(member => member.AppUserId == userId && member.ProjectId == task.ProjectId)
                        .Select(member => member.ProjectRole)
                        .FirstOrDefault()
                })
                .ToListAsync();
            

            return Ok(tasks);
        }

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpGet("user/{userId}/count3/{count}")]
        public async Task<ActionResult<IEnumerable<ProjectTask>>> GetClosedTasksByUserId(int userId, int count)
        {
            var tasks = await _context.ProjectTasks
                .Where(task => task.AppUserId == userId && task.TskStatusId==task.TskStatus.Id && task.TskStatus.StatusName=="InReview" && !task.IsOriginProjectArchived)
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
                    AppUser = _context.Users.FirstOrDefault(u => u.Id == task.AppUserId),
                    ProjectRole = _context.ProjectMembers
                        .Where(member => member.AppUserId == userId && member.ProjectId == task.ProjectId)
                        .Select(member => member.ProjectRole)
                        .FirstOrDefault()
                })
                .ToListAsync();
            

            return Ok(tasks);
        }

        // kada pomeram taskove iz archived saljem listu zbog boljih performansi
        [Authorize(Roles = "ProjectManager,Member")]
        [HttpPut("UpdateArchTasksToCompleted")]
        public async Task<IActionResult> UpdateTasksToCompleted([FromBody] List<int> taskIds)
        {
            var test = await _context.ProjectTasks.FirstOrDefaultAsync(x => x.Id == taskIds[0]);

            if(test==null)
            {
                return BadRequest("No tasks to update");
            }

            if(!await RoleCheck(test.ProjectId,[ProjectRole.ProjectManager,ProjectRole.ProjectOwner,ProjectRole.Manager]))
                return Unauthorized("Invalid role");

            var InProgressId = await _context.TaskStatuses
                .Where(s => s.StatusName == "InProgress")
                .Select(s => s.Id)
                .FirstOrDefaultAsync();

            if (InProgressId == 0)
            {
                return NotFound("InProgress status not found.");
            }

            var tasksToUpdate = await _context.ProjectTasks
                .Where(t => taskIds.Contains(t.Id))
                .ToListAsync();

            foreach (var task in tasksToUpdate)
            {
                task.TskStatusId = InProgressId;
                _notificationService.DeArchiveRelatedTaskNotifications(task.Id);
            }
            await _context.SaveChangesAsync();

            var projectId = tasksToUpdate[0].ProjectId;
            await updateProgress(projectId);

            return Ok(new { message = "Tasks updated to InProgress status." });
        }
        
        [Authorize(Roles = "ProjectManager,Member")]
        [HttpPost("timeUpdateGantt/{id}")]
        public async Task<ActionResult> UpdateTaskTimeGantt(int id, DateTimeDto newDateTime){
            var task = await _context.ProjectTasks.FirstOrDefaultAsync(x=>x.Id == id);

            if(!await RoleCheck(task.ProjectId,[ProjectRole.ProjectManager,ProjectRole.ProjectOwner]))
                return Unauthorized("Invalid role");

            task.StartDate = newDateTime.StartDate.AddDays(1);
            task.EndDate = newDateTime.EndDate.AddDays(1);//sace da pamti normalno

            await _context.SaveChangesAsync();
            return Ok(task);
        }

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpPost("changeSectionGantt")]
        public async Task<IActionResult> ChangeSectionGantt(SectionChangeDTO dto){

            var task = await _context.ProjectTasks.FirstOrDefaultAsync(x=>x.Id == dto.taskId);
            var section = await _context.ProjectSections.FirstOrDefaultAsync(x=>x.Id == dto.sectionId);

            if(task == null){
                return NotFound("TASK ID NOT FOUND "+dto.taskId);
            }

            if(!await RoleCheck(task.ProjectId,[ProjectRole.ProjectManager,ProjectRole.ProjectOwner]))
                return Unauthorized("Invalid role");

            if(section == null && dto.sectionId!=0){
                //ako je ovo stanje onda je neki error
                //poenta je sto treba da mozes da izbacis task iz section-a
                //section id 0 ce da bude prosledjen sa fronta samo u slucaju izbacivanja iz sectiona
                //ukoliko dobijem null ovde a prosledio sam !=0 sectionId, to znaci da sam poslao nepostojeci section
                return NotFound("SECTION ID NOT FOUND "+dto.sectionId);
            }
            
            if(dto.sectionId!=0){//ako smo prosledili id 0 onda ide u no section
                task.ProjectSectionId = dto.sectionId;
                task.ProjectSection = section;
            }
            else{
                task.ProjectSectionId = null;
                task.ProjectSection = null;
            }
            await _context.SaveChangesAsync();
            return Ok();

        }

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpDelete("deleteTask/{taskId}")]
        public async Task<IActionResult> DeleteTask(int taskId)
        {
            var task = await _context.ProjectTasks.FindAsync(taskId);

            if(!await RoleCheck(task.ProjectId,[ProjectRole.ProjectManager,ProjectRole.ProjectOwner,ProjectRole.Manager]))
                return Unauthorized("Invalid role");

            if (task == null)
            {
                return NotFound("Task not found.");
            }

            // Delete task dependencies
            var taskDependencies = _context.TaskDependencies.Where(dep => dep.TaskId == taskId || dep.DependencyTaskId == taskId);
            _context.TaskDependencies.RemoveRange(taskDependencies);

            // Delete comments associated with the task
            var comments = _context.Comments.Where(c => c.TaskId == taskId);
            _context.Comments.RemoveRange(comments);
            // Set notifications related to the task to null
            var notifications = _context.Notifications.Where(n => n.task_id == taskId);
            foreach (var notification in notifications)
            {
                notification.task_id = null;
            }

            var projectId = task.ProjectId;
            _context.ProjectTasks.Remove(task);

            await _context.SaveChangesAsync();
            await updateProgress(projectId);

            return Ok(new { message = "Task and related data deleted successfully." });
        }

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpGet("updateProgress/{projectId}")]
        public async Task<ActionResult> updateProgress(int projectId)
        {
            if(!await RoleCheck(projectId,[ProjectRole.ProjectManager,ProjectRole.ProjectOwner]))
                return Unauthorized("Invalid role");

            var project = await _context.Projects.FindAsync(projectId);
            var TasksCount = await _context.ProjectTasks.CountAsync(x => x.ProjectId == projectId && x.TskStatus.StatusName != "Archived");
            var CompletedTasksCount = await _context.ProjectTasks.CountAsync(x => x.TskStatus.StatusName == "Completed" && x.ProjectId == projectId);

            project.Progress = TasksCount == 0 ? 0 : (int)(((double)CompletedTasksCount/TasksCount)*100);

            await _context.SaveChangesAsync();

            return Ok("Project progress updated");
        } 

        [Authorize(Roles = "ProjectManager,Member")]
        [HttpGet("getTaskByName/{taskName}/{projectId}")]
        public async Task<ActionResult<int>> GetTaskByName(string taskName,int projectId)
        {
            var task = await _context.ProjectTasks.FirstOrDefaultAsync(task => task.TaskName.ToLower() == taskName.ToLower() && task.ProjectId==projectId);
            return Ok(task);
        }

        public async Task<bool> RoleCheck(int projectId, List<ProjectRole> roles)
        {
            string authHeader = HttpContext.Request.Headers["Authorization"];
            if (authHeader != null && authHeader.StartsWith("Bearer "))
            {
                string token = authHeader.Substring("Bearer ".Length).Trim();
                var tokenHandler = new JwtSecurityTokenHandler();
                var jsonToken = tokenHandler.ReadJwtToken(token);

                var userid = int.Parse(jsonToken.Claims.FirstOrDefault(c => c.Type == "nameid").Value);
                var ProjectMember = await _context.ProjectMembers.FirstOrDefaultAsync(x => x.ProjectId == projectId && x.AppUserId == userid && roles.Contains(x.ProjectRole));
            
                return ProjectMember != null;
            }
            return false;
        }
    }

    
}