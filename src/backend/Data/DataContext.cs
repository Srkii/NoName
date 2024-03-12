using backend.Entities;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<AppUser> Users { get; set; }
        public DbSet<Project> Projects {get; set;}
        public DbSet<ProjectMember> ProjectMembers {get; set;}
        public DbSet<ProjectTask> ProjectTasks {get; set;}
        public DbSet<TaskMember> TaskMembers {get; set;}
        public DbSet<TaskDependency> TaskDependencies {get; set;}
        public DbSet<TaskProjectDependency> TaskProjectDependencies {get; set;}
        
    }
}