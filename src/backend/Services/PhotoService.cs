
using backend.Interfaces;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;

namespace backend.Services
{
    [Authorize]
    public class PhotoService : IPhotoService
    {
    
        public readonly string _path = Directory.GetCurrentDirectory()+"\\Assets\\Images";

        public string AddPhoto(IFormFile file)
        {
            if (file.Length > 0)
            {
                string filepath = Path.Combine(_path, file.FileName);
                using (Stream filestream = new FileStream(filepath, FileMode.Create))
                {
                    file.CopyTo(filestream);
                }
                return filepath;
            }
            else return null;
        }

        public void DeletePhoto(string url)
        {
            if (File.Exists(url))
            {
                File.Delete(url);
            }
        }
    }
}