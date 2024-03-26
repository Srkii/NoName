﻿using System.ComponentModel.DataAnnotations;

namespace backend.DTO.TaskDTOs
{
    public class ChangeTaskInfoDto
    {
        [Required]
        public int Id { get; set; }
        public string TaskName { get; set; }
        public string Description { get; set; }
        public TaskStatus? TaskStatus { get; set; }
        public int AppUserId { get; set; }
        public int ProjectId { get; set; }
    }
}
