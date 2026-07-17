using ERMS.Application.DTOs.Department;

namespace ERMS.Application.Interfaces;

public interface IDepartmentService
{
    Task<List<DepartmentDto>> GetAllAsync();
    Task<DepartmentDto> CreateAsync(CreateDepartmentDto dto);
    Task<DepartmentDto> UpdateAsync(int id, UpdateDepartmentDto dto);
}