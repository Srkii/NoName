using System;

namespace backend.Interfaces
{
    public interface IEmailSender
    {
        Task SendEmailAsync(string email);
    }
}