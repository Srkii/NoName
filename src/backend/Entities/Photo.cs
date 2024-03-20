using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace backend.Entities
{
    public class Photo
    {
        public int Id { get; set; }
        public string url { get; set; }
        public string PublicId { get; set; }
        public int AppUserId { get; set; }

        public AppUser AppUser { get; set; }// nzm dal mi treba will find out soon
    }
}