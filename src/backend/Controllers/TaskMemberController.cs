using backend.Data;
using backend.DTOs;
using backend.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace backend.Controllers
{
    public class TaskMemberController : BaseApiController
    {
        private readonly DataContext _context;

        public TaskMemberController(DataContext context)
        {
            _context = context;
        }

        [HttpPost]
        public async Task<ActionResult<TaskMember>> CreateTask(TaskMemberDTO taskDto)
        {
            var taskMember = new TaskMember
            {
                TaskId = taskDto.TaskId,
                AppUserId = taskDto.AppUserId,
                ProjectId = taskDto.ProjectId
            };

            _context.TaskMembers.Add(taskMember);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetTaskMember), new { id = taskMember.TaskId }, taskDto);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<TaskMember>>> GetTaskMembers()
        {
            var taskMembers = await _context.TaskMembers.ToListAsync();
            return taskMembers;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<TaskMember>> GetTaskMember(int id)
        {
            var taskMember = await _context.TaskMembers.FindAsync(id);
            if (taskMember == null)
            {
                return NotFound();
            }
            return taskMember;
        }
    }
}
