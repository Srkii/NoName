using System.ComponentModel.DataAnnotations;

namespace backend.Entities
{
    public class TaskMember
    {
        // foreign key properties
        public int TaskId { get; set; }
        public int AppUserId { get; set; }
        public int ProjectId { get; set; }

        // navigation properties
        public ProjectTask Task {get; set; }
        public ProjectMember Member {get; set; }
    }
}