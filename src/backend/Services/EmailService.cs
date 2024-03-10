using System.Net;
using System.Net.Mail;
using backend.Interfaces;

namespace backend.Services
{
    public class EmailService : IEmailSender
    {
        public Task SendEmailAsync(string email)
        {
            Guid uniqueKey = Guid.NewGuid();
            var mail = "accessdenied522@gmail.com";
            var password = "redg vikb xzxo edhb";

            string subject = "Invitation to Register on Our Application";
            string link = "http://localhost:4200/register?unique="+uniqueKey;

            string message = "Dear User, \n\n" +
                 "We hope this message finds you well. You have been invited to join our community at 'Naziv aplikacije' ! \n" +
                 "To complete your registration, please follow the link below: \n\n" + link + "\n" +
                 "Best regards, \n" + 
                 "Access Denied, \n" +
                 "Naziv Aplikacije";

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