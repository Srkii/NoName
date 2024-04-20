using backend.Data;
using backend.DTO;
using backend.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Interfaces;
namespace backend.Controllers
{
    public class CommentsController:BaseApiController
    {
        private readonly DataContext _context;
        INotificationService _notificationService;
        public CommentsController(DataContext context,INotificationService notificationService)
        {
            _context = context;
            _notificationService = notificationService;
        }
        
        [AllowAnonymous]
        [HttpPost("postComment")] // /api/comments/postComment
        public async Task<IActionResult> PostComment(CommentDto commentDto)
        {
            //doraditi: treba da proveri dal task postoji pa onda da post komentar. ako ne postoji vraca BadRequest sa opisom greske
            var task = await _context.ProjectTasks.FindAsync(commentDto.TaskId);
            var comment = new Comment
            {
                TaskId = commentDto.TaskId,
                Content = commentDto.Content,
                SenderId = commentDto.SenderId,
                SenderFirstName = commentDto.SenderFirstName,
                SenderLastName = commentDto.SenderLastName
            };
            _context.Comments.Add(comment);
            await _notificationService.TriggerNotification(commentDto.TaskId,commentDto.SenderId,NotificationType.Comment);
            await _context.SaveChangesAsync();
            return Ok(comment);
        }

        [AllowAnonymous]
        [HttpGet("getComments/{taskId}")]
        public async Task<ActionResult<IEnumerable<Comment>>> GetComments(int taskId)
        {
            var comments = await _context.Comments
                .Where(x => x.TaskId == taskId)
                .ToListAsync();
            
            return Ok(comments);
        }




        // [Authorize]
        [AllowAnonymous]
        [HttpDelete("deleteComment/{commentId}")]
        public async Task<ActionResult> DeleteComment(int commentId)
        {
            var comment = await _context.Comments.FindAsync(commentId);

        if (comment == null)
            return BadRequest("Comment doesn't exist");
        
        // Check if the user is authorized to delete the comment
        // (You might need to implement this logic depending on your authentication mechanism)
        // For example:
        // if (comment.SenderId != currentUserId)
        //     return BadRequest("Unauthorized: You cannot delete other people's comments");

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

        [AllowAnonymous]
        [HttpPut("updateComment/{commentId}/{content}")]
        public async Task<IActionResult> UpdateComment(int commentId, string content)
        {
            // Find the comment in the database by its ID
            var comment = await _context.Comments.FindAsync(commentId);

            // Check if the comment exists
            if (comment == null)
            {
                return NotFound("Comment not found");
            }

            // Update the content and message sent date of the comment
            comment.Content = content;
            comment.Edited=true;
            comment.MessageSent = DateTime.UtcNow.AddHours(2); // Update the message sent date

            // Save the changes to the database
            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                // Handle concurrency conflicts, if necessary
                throw; // You can customize this behavior as per your requirements
            }

            // Return a success response with the updated comment
            return Ok(comment);
    }   

    }

}