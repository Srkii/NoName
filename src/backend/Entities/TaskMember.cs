namespace backend.Entities
{
    public class TaskMember
    { //set composite key
        public int TaskId { get; set; }
        public int MemberId { get; set; }
    }
}