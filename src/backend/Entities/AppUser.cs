﻿namespace backend.Entities
{
    public enum UserRole
    {
        Admin,
        Member,
        ProjectManager
    }
    public class AppUser
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public byte[] PasswordHash { get; set; }
        public byte[] PasswordSalt { get; set; }
        public UserRole Role { get; set; }
    }
}