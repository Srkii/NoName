
using backend.Data;
using backend.DTO;
using backend.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

public class CommentsController:BaseApiController
{
    private readonly DataContext context;
    public CommentsController(DataContext context)
    {
        this.context = context;
    }

    [HttpPost("postComment")] // /api/comments/postComment
    public async Task<IActionResult> PostComment(CommentDto commentDto)
    {
        var comment = new Comment
        {
            TaskId = commentDto.TaskId,
            Content = commentDto.Content,
            SenderId = commentDto.SenderId,
            SenderFirstName = commentDto.SenderFirstName,
            SenderLastName = commentDto.SenderLastName
        };
        context.Comments.Add(comment);
        await context.SaveChangesAsync();
        return Ok(comment);
    }

    [HttpGet("getComments/{taskId}")] // /api/comments/getComments
    public async Task<IActionResult> GetComments(int taskId)
    {
        var comments = await context.Comments.Where(x => x.TaskId == taskId).OrderByDescending(x => x.MessageSent).ToListAsync();
        return Ok(comments);
    }

    [Authorize]
    [HttpDelete("deleteComment")]
    public async Task<IActionResult> DeleteComment(DeleteCommentDto dto)
    {
        var comment = await context.Comments.FindAsync(dto.CommentId);

        if(comment == null)
            return BadRequest("Comment doesn't exist");
        
        if(dto.Role!=UserRole.Admin && comment.SenderId != dto.SenderId)
            return BadRequest("Unvalid request: You cannot delete other's people comments");
        
        context.Comments.Remove(comment);
        await context.SaveChangesAsync();
        
        var responseData = new 
        {
            CommentId = comment.Id,
            EmailSent = true,
            Message = "Comment deleted successfully."
        };

        return Ok(responseData);
    }
}
