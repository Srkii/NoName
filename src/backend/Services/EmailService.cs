using System.Net;
using System.Net.Mail;
using backend.Entities;
using backend.Interfaces;

namespace backend.Services
{
    public class EmailService : IEmailSender
    {
        public Task SendEmailAsync(string email,string subject,string message)
        {
            var mail = "accessdenied522@gmail.com";
            var password = "redg vikb xzxo edhb";

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