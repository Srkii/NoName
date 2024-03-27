using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Interfaces
{
    public interface IUploadService
    {
        string AddFile(IFormFile file);
        void DeleteFile(string url);
    }
}