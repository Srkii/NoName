using backend.DTO;
using backend.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

public class EmailController:BaseApiController
{
    private readonly IEmailSender emailSender;

    public EmailController(IEmailSender emailSender)
    {
        this.emailSender = emailSender;
    }

    [HttpPost("send")]
    public async void SendEmail(EmailDto emailDto)
    {
        await emailSender.SendEmailAsync(emailDto.Receiver);
    }
}
