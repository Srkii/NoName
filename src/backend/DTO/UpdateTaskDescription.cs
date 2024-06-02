using System.ComponentModel.DataAnnotations;

namespace backend.DTO;

public class UpdateTaskDescription
{
    public int Id { get; set; }

    [StringLength(5000, ErrorMessage = "Description cannot be longer than 5000 characters")]
    public string Description { get; set; }
}
