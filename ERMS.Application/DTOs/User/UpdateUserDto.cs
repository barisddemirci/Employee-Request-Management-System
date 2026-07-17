using ERMS.Domain.Enums;

namespace ERMS.Application.DTOs.Admin;

public class UpdateUserDto
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public Role Role { get; set; }
    public int DepartmentId { get; set; }
    public int? ManagerId { get; set; }
    public bool IsActive { get; set; }
}