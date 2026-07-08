using System;
using System.Collections.Generic;
using System.Text;

namespace ERMS.Domain.Entities
{
    public class Departments
    {
        public int DepartmentId { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
    }
}
