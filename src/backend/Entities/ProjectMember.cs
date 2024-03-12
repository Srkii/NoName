namespace backend.Entities
{
    public enum ProjectRole
    {
        ProjectOwner,
        Manager,
        Participant,
        Guest
    }
    public class ProjectMember
    { //set composite key
        public int UserId { get; set; }
        public int ProjectId { get; set; }
        public ProjectRole ProjectRole  { get; set; }
    }
}