using backend.Data;
using backend.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using backend.Entities;
namespace backend.Controllers
{
    public class FileUploadController : BaseApiController
    {
        private readonly DataContext _context;
        private readonly ITokenService _tokenService;
        private readonly IPhotoService _photoService;
        private readonly IUploadService _uploadService;
        private readonly INotificationService _notificationService;
        public FileUploadController(DataContext context, ITokenService ts,IPhotoService ps,IUploadService us,INotificationService ns)
        {
            _context = context;
            _tokenService = ts;
            _photoService = ps;
            _uploadService = us;
            _notificationService = ns;
        }

        [HttpPost("uploadpfp/{id}")] // /api/FileUpload
        public async Task<ActionResult> UploadImage(int id,IFormFile image){
            if(image==null) return BadRequest("photo is null");
            if(!_photoService.IsPhoto(image)) return BadRequest("file sent is not a photo.");
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == id);
            
            if(user.ProfilePicUrl!=null){
                _photoService.DeletePhoto(user.ProfilePicUrl);
                user.ProfilePicUrl = _photoService.AddPhoto(image);
            }else{
                user.ProfilePicUrl = _photoService.AddPhoto(image);
            }
            await _context.SaveChangesAsync();
            return Ok(user);
        }
        [HttpGet("images/{filename}")]
        public FileContentResult GetImage(string filename){
            string path = Directory.GetCurrentDirectory()+"\\Assets\\Images\\"+filename;
            var imageBytes = System.IO.File.ReadAllBytes(path);

            return File(imageBytes,"image/jpeg");
        }

        [HttpPost("uploadfile/{id}")]
        public async Task<ActionResult> UploadFile(int id,[FromForm]int user_id,IFormFile file){
            if(file==null) return BadRequest("file is null");
            var task = await _context.ProjectTasks.FirstOrDefaultAsync(x => x.Id==id);
            //doraditi: treba da proveri dal task postoji pa onda da upload file. ako ne postoji vraca BadRequest sa opisom greske
            var filename =  _uploadService.AddFile(file);
            var attachment = new Attachment{
                task_id = task.Id,
                sender_id = user_id,
                url = filename
            };
            
            _context.Attachments.Add(attachment);
            await _notificationService.TriggerNotification(task.Id,user_id,NotificationType.Attachment);
            await _context.SaveChangesAsync();
            return Ok(attachment);
        }
        // [HttpGet("files/{filename}")]
        // public FileContentResult GetFile(string filename){
        //     string path = Directory.GetCurrentDirectory()+"\\Assets\\Attachments"+filename;

        //     var fileBytes = System.IO.File.ReadAllBytes(path);

        //     return File(fileBytes,)
        // } za sad ne mora, smislicu posle
    }
}