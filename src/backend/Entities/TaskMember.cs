using System.ComponentModel.DataAnnotations;

namespace backend.Entities
{
    public class TaskMember
    {   
        // ako zelis da samo jedan moze da bude na 1 task. promeni PK u taskid, projectid
        // na taj nacin 1 task na 1 projektu ima samo 1og clana
        // mada ne moze ni AppUser nego mora ProjectMember da bi on bio na tom projektu

        // foreign key properties
        public int TaskId { get; set; }
        public int AppUserId { get; set; }
        public int ProjectId { get; set; }

        // navigation properties
        public ProjectTask Task {get; set; }
        public ProjectMember Member {get; set; }
    }
}