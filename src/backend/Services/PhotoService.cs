using backend.Interfaces;
using Microsoft.AspNetCore.Authorization;
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
                return file.FileName;
            }
            else return null;
        }

        public void DeletePhoto(string url)
        {
            string path_check=_path+"\\"+url;
            if (File.Exists(path_check))
            {
                File.Delete(path_check);
            }
        }
    }
}