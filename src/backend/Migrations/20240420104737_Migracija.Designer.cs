﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using backend.Data;

#nullable disable

namespace backend.Migrations
{
    [DbContext(typeof(DataContext))]
    [Migration("20240420104737_Migracija")]
    partial class Migracija
    {
        /// <inheritdoc />
        protected override void BuildTargetModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder.HasAnnotation("ProductVersion", "8.0.3");

            modelBuilder.Entity("backend.Entities.AppUser", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<bool>("Archived")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Email")
                        .HasColumnType("TEXT");

                    b.Property<string>("FirstName")
                        .HasColumnType("TEXT");

                    b.Property<string>("LastName")
                        .HasColumnType("TEXT");

                    b.Property<byte[]>("PasswordHash")
                        .HasColumnType("BLOB");

                    b.Property<byte[]>("PasswordSalt")
                        .HasColumnType("BLOB");

                    b.Property<string>("ProfilePicUrl")
                        .HasColumnType("TEXT");

                    b.Property<int>("Role")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.ToTable("Users");
                });

            modelBuilder.Entity("backend.Entities.Attachment", b =>
                {
                    b.Property<int>("id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("sender_id")
                        .HasColumnType("INTEGER");

                    b.Property<int>("task_id")
                        .HasColumnType("INTEGER");

                    b.Property<string>("url")
                        .HasColumnType("TEXT");

                    b.HasKey("id");

                    b.HasIndex("sender_id");

                    b.HasIndex("task_id");

                    b.ToTable("Attachments");
                });

            modelBuilder.Entity("backend.Entities.Comment", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Content")
                        .HasColumnType("TEXT");

                    b.Property<bool>("Edited")
                        .HasColumnType("INTEGER");

                    b.Property<DateTime>("MessageSent")
                        .HasColumnType("TEXT");

                    b.Property<string>("SenderFirstName")
                        .HasColumnType("TEXT");

                    b.Property<int>("SenderId")
                        .HasColumnType("INTEGER");

                    b.Property<string>("SenderLastName")
                        .HasColumnType("TEXT");

                    b.Property<int>("TaskId")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.ToTable("Comments");
                });

            modelBuilder.Entity("backend.Entities.Invitation", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Email")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("ExpirationDate")
                        .HasColumnType("TEXT");

                    b.Property<bool>("IsUsed")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Token")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("Invitations");
                });

            modelBuilder.Entity("backend.Entities.Notification", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("Type")
                        .HasColumnType("INTEGER");

                    b.Property<DateTime>("dateTime")
                        .HasColumnType("TEXT");

                    b.Property<int?>("project_id")
                        .HasColumnType("INTEGER");

                    b.Property<bool>("read")
                        .HasColumnType("INTEGER");

                    b.Property<int>("reciever_id")
                        .HasColumnType("INTEGER");

                    b.Property<int>("sender_id")
                        .HasColumnType("INTEGER");

                    b.Property<int?>("task_id")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.HasIndex("project_id");

                    b.HasIndex("reciever_id");

                    b.HasIndex("sender_id");

                    b.HasIndex("task_id");

                    b.ToTable("Notifications");
                });

            modelBuilder.Entity("backend.Entities.Project", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Description")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("EndDate")
                        .HasColumnType("TEXT");

                    b.Property<int>("Priority")
                        .HasColumnType("INTEGER");

                    b.Property<string>("ProjectName")
                        .HasColumnType("TEXT");

                    b.Property<int>("ProjectStatus")
                        .HasColumnType("INTEGER");

                    b.Property<DateTime>("StartDate")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("Projects");
                });

            modelBuilder.Entity("backend.Entities.ProjectMember", b =>
                {
                    b.Property<int>("AppUserId")
                        .HasColumnType("INTEGER");

                    b.Property<int>("ProjectId")
                        .HasColumnType("INTEGER");

                    b.Property<int>("ProjectRole")
                        .HasColumnType("INTEGER");

                    b.HasKey("AppUserId", "ProjectId");

                    b.HasIndex("ProjectId");

                    b.ToTable("ProjectMembers");
                });

            modelBuilder.Entity("backend.Entities.ProjectSection", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int>("ProjectId")
                        .HasColumnType("INTEGER");

                    b.Property<string>("SectionName")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("ProjectId");

                    b.ToTable("ProjectSections");
                });

            modelBuilder.Entity("backend.Entities.ProjectTask", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<int?>("AppUserId")
                        .HasColumnType("INTEGER");

                    b.Property<DateTime>("DateCreated")
                        .HasColumnType("TEXT");

                    b.Property<string>("Description")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("EndDate")
                        .HasColumnType("TEXT");

                    b.Property<int>("ProjectId")
                        .HasColumnType("INTEGER");

                    b.Property<int?>("ProjectSectionId")
                        .HasColumnType("INTEGER");

                    b.Property<DateTime>("StartDate")
                        .HasColumnType("TEXT");

                    b.Property<string>("TaskName")
                        .HasColumnType("TEXT");

                    b.Property<int>("TskStatusId")
                        .HasColumnType("INTEGER");

                    b.HasKey("Id");

                    b.HasIndex("AppUserId");

                    b.HasIndex("ProjectId");

                    b.HasIndex("ProjectSectionId");

                    b.HasIndex("TskStatusId");

                    b.ToTable("ProjectTasks");
                });

            modelBuilder.Entity("backend.Entities.TaskDependency", b =>
                {
                    b.Property<int>("TaskId")
                        .HasColumnType("INTEGER");

                    b.Property<int>("DependencyTaskId")
                        .HasColumnType("INTEGER");

                    b.HasKey("TaskId", "DependencyTaskId");

                    b.HasIndex("DependencyTaskId");

                    b.ToTable("TaskDependencies", null, t =>
                        {
                            t.HasCheckConstraint("DifferentTasks", "TaskId <> DependencyTaskId");
                        });
                });

            modelBuilder.Entity("backend.Entities.UserRequest", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Email")
                        .HasColumnType("TEXT");

                    b.Property<DateTime>("ExpirationDate")
                        .HasColumnType("TEXT");

                    b.Property<bool>("IsUsed")
                        .HasColumnType("INTEGER");

                    b.Property<string>("Token")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.ToTable("UserRequests");
                });

            modelBuilder.Entity("backend.TskStatus", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("INTEGER");

                    b.Property<string>("Color")
                        .HasColumnType("TEXT");

                    b.Property<int>("Position")
                        .HasColumnType("INTEGER");

                    b.Property<int>("ProjectId")
                        .HasColumnType("INTEGER");

                    b.Property<string>("StatusName")
                        .HasColumnType("TEXT");

                    b.HasKey("Id");

                    b.HasIndex("ProjectId");

                    b.ToTable("TaskStatuses");
                });

            modelBuilder.Entity("backend.Entities.Attachment", b =>
                {
                    b.HasOne("backend.Entities.AppUser", "Sender")
                        .WithMany()
                        .HasForeignKey("sender_id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("backend.Entities.ProjectTask", "Task")
                        .WithMany()
                        .HasForeignKey("task_id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Sender");

                    b.Navigation("Task");
                });

            modelBuilder.Entity("backend.Entities.Notification", b =>
                {
                    b.HasOne("backend.Entities.Project", "Project")
                        .WithMany()
                        .HasForeignKey("project_id");

                    b.HasOne("backend.Entities.AppUser", "Reciever")
                        .WithMany()
                        .HasForeignKey("reciever_id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("backend.Entities.AppUser", "Sender")
                        .WithMany()
                        .HasForeignKey("sender_id")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("backend.Entities.ProjectTask", "Task")
                        .WithMany()
                        .HasForeignKey("task_id");

                    b.Navigation("Project");

                    b.Navigation("Reciever");

                    b.Navigation("Sender");

                    b.Navigation("Task");
                });

            modelBuilder.Entity("backend.Entities.ProjectMember", b =>
                {
                    b.HasOne("backend.Entities.AppUser", "AppUser")
                        .WithMany()
                        .HasForeignKey("AppUserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("backend.Entities.Project", "Project")
                        .WithMany()
                        .HasForeignKey("ProjectId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("AppUser");

                    b.Navigation("Project");
                });

            modelBuilder.Entity("backend.Entities.ProjectSection", b =>
                {
                    b.HasOne("backend.Entities.Project", "Project")
                        .WithMany()
                        .HasForeignKey("ProjectId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Project");
                });

            modelBuilder.Entity("backend.Entities.ProjectTask", b =>
                {
                    b.HasOne("backend.Entities.AppUser", "AppUser")
                        .WithMany()
                        .HasForeignKey("AppUserId");

                    b.HasOne("backend.Entities.Project", "Project")
                        .WithMany()
                        .HasForeignKey("ProjectId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("backend.Entities.ProjectSection", "ProjectSection")
                        .WithMany("Tasks")
                        .HasForeignKey("ProjectSectionId");

                    b.HasOne("backend.TskStatus", "TskStatus")
                        .WithMany("Tasks")
                        .HasForeignKey("TskStatusId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("AppUser");

                    b.Navigation("Project");

                    b.Navigation("ProjectSection");

                    b.Navigation("TskStatus");
                });

            modelBuilder.Entity("backend.Entities.TaskDependency", b =>
                {
                    b.HasOne("backend.Entities.ProjectTask", "DependencyTask")
                        .WithMany()
                        .HasForeignKey("DependencyTaskId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("backend.Entities.ProjectTask", "Task")
                        .WithMany()
                        .HasForeignKey("TaskId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("DependencyTask");

                    b.Navigation("Task");
                });

            modelBuilder.Entity("backend.TskStatus", b =>
                {
                    b.HasOne("backend.Entities.Project", "Project")
                        .WithMany()
                        .HasForeignKey("ProjectId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Project");
                });

            modelBuilder.Entity("backend.Entities.ProjectSection", b =>
                {
                    b.Navigation("Tasks");
                });

            modelBuilder.Entity("backend.TskStatus", b =>
                {
                    b.Navigation("Tasks");
                });
#pragma warning restore 612, 618
        }
    }
}
