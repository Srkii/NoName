namespace backend.Entities;

public class AppUser
{
    public int Id { get; set; }
    public string FirstName { get; set; }
    public string LastName { get; set; }
    public string Email { get; set; }
    // public byte[] PasswordHash { get; set; } enable kasnije kad se odradi logika za registraciju
    // public byte[] PasswordSalt { get; set; }
}
