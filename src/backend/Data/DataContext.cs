using backend.Entities;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace backend.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions options) : base(options) { }

        public DbSet<AppUser> Users { get; set; }
        public DbSet<Project> Projects {get; set;}
        public DbSet<ProjectMember> ProjectMembers {get; set;}
        public DbSet<ProjectTask> ProjectTasks {get; set;}
        public DbSet<TaskMember> TaskMembers {get; set;}
        public DbSet<TaskDependency> TaskDependencies {get; set;}
        public DbSet<Invitation> Invitations {get; set;}
        public DbSet<UserRequest> UserRequests {get; set;}
        public DbSet<Attachment> Attachments{get; set;}
        public DbSet<Comment> Comments {get; set;}
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<ProjectMember>(entity =>
            {
                entity.HasKey(pm => new { pm.AppUserId, pm.ProjectId });

                entity.HasOne(pm => pm.AppUser)
                    .WithMany() // Define the relationship between ProjectMember and AppUser
                    .HasForeignKey(pm => pm.AppUserId);

                entity.HasOne(pm => pm.Project)
                    .WithMany() // Define the relationship between ProjectMember and Project
                    .HasForeignKey(pm => pm.ProjectId);
            });

            modelBuilder.Entity<ProjectTask>(entity =>
            {
                entity.HasKey(pt => pt.Id); // define Id as the primary key

                entity.HasOne(pt => pt.Project)
                    .WithMany() // define the relationship between ProjectTask and Project
                    .HasForeignKey(pt => pt.ProjectId); // define ProjectId as the foreign key
            });

            modelBuilder.Entity<TaskDependency>(entity =>
            {
                entity.HasKey(td => new { td.TaskId, td.DependencyTaskId });

                entity.HasOne(td => td.Task)
                    .WithMany()
                    .HasForeignKey(td => td.TaskId);

                entity.HasOne(td => td.DependencyTask)
                    .WithMany()
                    .HasForeignKey(td => td.DependencyTaskId);
                // task can't be dependant on itself
                entity.ToTable("TaskDependencies", t => t.HasCheckConstraint("DifferentTasks", "TaskId <> DependencyTaskId"));
            });

            modelBuilder.Entity<TaskMember>(entity =>
            {
                entity.HasKey(tm => new { tm.TaskId, tm.AppUserId, tm.ProjectId });

                entity.HasOne(tm => tm.Task)
                    .WithMany()
                    .HasForeignKey(tm => tm.TaskId);

                entity.HasOne(tm => tm.Member)
                    .WithMany()
                    .HasForeignKey(tm => new { tm.AppUserId, tm.ProjectId }); // composite foreign key
            });
        }
    }
}