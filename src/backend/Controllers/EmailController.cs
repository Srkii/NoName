﻿using backend.Data;
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
    public async void SendInvitationEmail(EmailDto emailDto)
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
    }
}
