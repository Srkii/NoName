using backend.Data;
using backend.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Services;
namespace backend.Controllers
{
    public class FileUploadController : BaseApiController
    {
        private readonly DataContext _context;
        private readonly ITokenService _tokenService;
        private readonly IPhotoService _photoService;

        public FileUploadController(DataContext context, ITokenService ts,IPhotoService ps)
        {
            _context = context;
            _tokenService = ts;
            _photoService = ps;
        }

        [HttpPost("uploadpfp/{id}")] // /api/FileUpload
        public async Task<ActionResult> UploadImage(int id,IFormFile image){
            if(image==null) return BadRequest("photo is null");
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

        /*
        TODO
        upload fotografije 
        removal fotografije
        upload attachmenta:
            za njih nije bitno sta su
            za profilne slike je bitno jer su veszane za korisnike direktno
            a za attachment nije bitno da li je .docx ili .png ili .c fajl 
            oni svi idu u attachment folder i izvlace se odatle za preuzimanje...
        */
    }
}