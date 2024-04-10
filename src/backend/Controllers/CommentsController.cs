using backend.Data;
using backend.DTO;
using backend.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;

namespace backend.Controllers
{
    public class CommentsController:BaseApiController
    {
        private readonly DataContext _context;
        public CommentsController(DataContext context)
        {
            _context = context;
        }
        
        [AllowAnonymous]
        [HttpPost("postComment")] // /api/comments/postComment
        public async Task<IActionResult> PostComment(CommentDto commentDto)
        {
            //doraditi: treba da proveri dal task postoji pa onda da post komentar. ako ne postoji vraca BadRequest sa opisom greske
            var comment = new Comment
            {
                TaskId = commentDto.TaskId,
                Content = commentDto.Content,
                SenderId = commentDto.SenderId,
                SenderFirstName = commentDto.SenderFirstName,
                SenderLastName = commentDto.SenderLastName
            };
            _context.Comments.Add(comment);
            await _context.SaveChangesAsync();
            return Ok(comment);
        }

        [AllowAnonymous]
        [HttpGet("getComments/{taskId}")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetComments(int taskId)
        {
            var comments = await _context.Comments
                .Where(x => x.TaskId == taskId)
                .OrderByDescending(x => x.MessageSent)
                .ToListAsync();
            
            return Ok(comments);
        }




        [Authorize]
        [HttpDelete("deleteComment")]
        public async Task<ActionResult> DeleteComment(DeleteCommentDto dto)
        {
            var comment = await _context.Comments.FindAsync(dto.CommentId);

            if(comment == null)
                return BadRequest("Comment doesn't exist");
            
            if(comment.SenderId != dto.SenderId)
                return BadRequest("Unvalid request: You cannot delete other's people comments");
            
            _context.Comments.Remove(comment);
            await _context.SaveChangesAsync();
            
            var responseData = new 
            {
                CommentId = comment.Id,
                EmailSent = true,
                Message = "Comment deleted successfully."
            };

            return Ok(responseData);
        }
    }
}