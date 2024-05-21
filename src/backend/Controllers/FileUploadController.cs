using backend.Data;
using backend.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using backend.Entities;
using System.Web;
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
            }
            user.ProfilePicUrl = _photoService.AddPhoto(image);
        
            await _context.SaveChangesAsync();
            return Ok(user);
        }
        [HttpGet("images/{filename}")]
        public FileContentResult GetImage(string filename){
            // string path = Directory.GetCurrentDirectory()+"\\Assets\\Images\\"+filename;
            string path = Path.Combine(Directory.GetCurrentDirectory(),"Assets","Images",filename);
            var imageBytes = System.IO.File.ReadAllBytes(path);
            string mimetype = GetMimeType(filename);
            return File(imageBytes,mimetype);
        }
        [HttpDelete("removepfp/{id}")]
        public async Task<OkObjectResult> RemoveImage(int id,string token){
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == id);
            if(user.ProfilePicUrl!=null){
                _photoService.DeletePhoto(user.ProfilePicUrl);
                user.ProfilePicUrl = null;
                await _context.SaveChangesAsync();
            }
            return Ok(user);
        }
        public async Task<ActionResult> RemovePfp(int id){
            var user = await _context.Users.FirstOrDefaultAsync(x => x.Id == id);
            if(user.ProfilePicUrl!=null){
                _photoService.DeletePhoto(user.ProfilePicUrl);
            }
            return Ok(user);
        }
        public string GetMimeType(string fileName){
            string extension = Path.GetExtension(fileName).ToLowerInvariant();
            switch (extension)
            {
                case ".jpg":
                case ".jpeg":
                    return "image/jpeg";
                case ".png":
                    return "image/png";
                case ".gif":
                    return "image/gif";
                case ".pdf":
                    return "application/pdf";
                case ".zip":
                    return "application/zip";
                case ".rar ":
                    return "application/rar";
                case ".doc":
                    return "application/msword";
                case ".docx":
                    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                case ".xls":
                    return "application/vnd.ms-excel";
                case ".xlsx":
                    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                case ".ppt":
                    return "application/vnd.ms-powerpoint";
                case ".pptx":
                    return "application/vnd.openxmlformats-officedocument.presentationml.presentation";
                case ".txt":
                    return "text/plain";
                case ".csv":
                    return "text/csv";
                case ".xlsm":
                    return "application/vnd.ms-excel.sheet.macroEnabled.12";
                default:
                    return "application/octet-stream"; // Fallback if the file type is not recognized
            }
        }

        [HttpPost("uploadfile/{id}")]
        public async Task<ActionResult> UploadFile(int id,[FromForm]int user_id,IFormFile file){
            if(file==null) return BadRequest("file is null");
            var task = await _context.ProjectTasks.FirstOrDefaultAsync(x => x.Id==id);
            var sender = await _context.Users.FirstOrDefaultAsync(x => x.Id == user_id);
            //doraditi: treba da proveri dal task postoji pa onda da upload file. ako ne postoji vraca BadRequest sa opisom greske
            if(task!=null){
                var filename =  _uploadService.AddFile(file);
                // var comment = new Comment{
                //     TaskId = task.Id,
                //     SenderId = user_id,
                //     SenderFirstName = sender.FirstName,
                //     SenderLastName = sender.LastName,
                //     Content = "",
                //     FileUrl = filename
                // };
                // _context.Comments.Add(comment);
                // await _context.SaveChangesAsync();
                // await _notificationService.TriggerNotification(task.Id,user_id,comment.Id,NotificationType.Attachment);
                return Ok();
            }else{
                return BadRequest("SPECIFIED TASK DOES NOT EXIST");
            }
        }
        [HttpGet("files/{filename}")]
        public FileContentResult GetFile(string filename){
            string path = Path.Combine(Directory.GetCurrentDirectory(),"Assets","Attachments",filename);
            string mimeType = GetMimeType(filename);
            var fileBytes = System.IO.File.ReadAllBytes(path);

            return File(fileBytes,mimeType);
        }
    }
}