using backend.Interfaces;

namespace backend.Services
{
    public class UploadService : IUploadService
    {
        public readonly string _path = Directory.GetCurrentDirectory()+"\\Assets\\Attachments";
        public string AddFile(IFormFile file)
        {
            if(file.Length>0){
                string filepath = Path.Combine(_path, file.FileName);
                using (Stream filestream = new FileStream(filepath, FileMode.Create))
                {
                    file.CopyTo(filestream);
                }
                return file.FileName;
            }
            else return null;
        }

        public void DeleteFile(string url)
        {
            if (File.Exists(url))
            {
                File.Delete(url);
            }
        }
    }
}