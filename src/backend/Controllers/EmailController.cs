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

    [HttpPost("send")]
    public async void SendEmail(EmailDto emailDto)
    {
        var invitation = new Invitation{
            Email = emailDto.Receiver,
            Token = Guid.NewGuid().ToString(),
            ExpirationDate = DateTime.UtcNow.AddDays(7),
            IsUsed = false
        };

        context.Invitations.Add(invitation);
        await context.SaveChangesAsync();
        
        await emailSender.SendEmailAsync(emailDto.Receiver,invitation.Token);
    }
}
