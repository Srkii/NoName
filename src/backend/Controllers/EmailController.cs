using backend.Data;
using backend.DTO;
using backend.Entities;
using backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

public class EmailController:BaseApiController
{

    private readonly DataContext context;
    private readonly IEmailSender emailSender;

    public EmailController(IEmailSender emailSender,DataContext context)
    {
        this.emailSender = emailSender;
        this.context = context;
    }

    [HttpPost("sendInvitation")]
    public async Task<IActionResult> SendInvitationEmail(EmailDto emailDto)
    {
        var invitation = new Invitation{
            Email = emailDto.Receiver,
            Token = Guid.NewGuid().ToString(),
            ExpirationDate = DateTime.UtcNow.AddDays(7),
            IsUsed = false
        };

        context.Invitations.Add(invitation);
        await context.SaveChangesAsync();
        
        string link = "http://localhost:4200/register?token="+invitation.Token;
        string subject = "Invitation to Register on Our Application";
        string message = "Dear User, \n\n" +
                 "We hope this message finds you well. You have been invited to join our community at 'Naziv aplikacije' ! \n" +
                 "To complete your registration, please follow the link below: \n\n" + link + "\n\n" +
                 "Best regards, \n" + 
                 "Access Denied, \n" +
                 "Naziv Aplikacije";
        
        await emailSender.SendEmailAsync(emailDto.Receiver,subject,message);

        var responseData = new 
        {
            InvitationId = invitation.Id,
            EmailSent = true,
            Message = "Invitation email sent successfully."
        };

        return Ok(responseData);
    }

    [HttpPost("sendRecovery")]
    public async Task<IActionResult> SendRecoveryEmail(EmailDto emailDto)
    {
        var request = new UserRequest{
            Email = emailDto.Receiver,
            Token = Guid.NewGuid().ToString(),
            ExpirationDate = DateTime.UtcNow.AddDays(7),
            IsUsed = false
        };

        context.UserRequests.Add(request);
        await context.SaveChangesAsync();
        
        string link = "http://localhost:4200/resetPassword?token="+request.Token;
        string subject = "Forgot password";
        string message = "Dear User, \n\n" +
                 "We received a request to reset the password for your account.\n" +
                 "To reset your password, click on the link below: \n\n" + link + "\n\n" +
                 "Best regards, \n" + 
                 "Access Denied, \n" +
                 "Naziv Aplikacije";
        
        await emailSender.SendEmailAsync(emailDto.Receiver,subject,message);

        var responseData = new 
        {
            InvitationId = request.Id,
            EmailSent = true,
            Message = "Request email sent successfully."
        };

        return Ok(responseData);
    }
}
