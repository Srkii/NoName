using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using backend.Interfaces;

namespace backend.Services
{
    public class EmailService : IEmailSender
    {
        public Task SendEmailAsync(string email, string subject, string message)
        {
            string mail = "accessdenied522@gmail.com";
            string password = "Admin_123";

            var client = new SmtpClient("smtp.gmail.com", 587)
            {
                Credentials = new NetworkCredential(mail,password),
                EnableSsl = true,
            };

            return client.SendMailAsync(
                new MailMessage(from: mail,to: email, subject, message)
            );
        }
    }
}