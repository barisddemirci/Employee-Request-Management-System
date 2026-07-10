using ERMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace ERMS.Domain.Entities
{
    public class User
    {
        public int UserId { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public Role Role { get; set; }
        public int DepartmentId { get; set; }
        public int ManagerId { get; set; }
        public bool IsActive { get; set; }


    }
}
