using ERMS.Application.DTOs.Department;
using ERMS.Application.Exceptions;
using ERMS.Application.Interfaces;
using ERMS.Domain.Entities;

namespace ERMS.Application.Services;

public class DepartmentService : IDepartmentService
{
    private readonly IRepository<Department> _departmentRepository;

    public DepartmentService(IRepository<Department> departmentRepository)
    {
        _departmentRepository = departmentRepository;
    }

    public async Task<List<DepartmentDto>> GetAllAsync()
    {
        var departments = await _departmentRepository.GetAllAsync();

        return departments
            .Select(d => new DepartmentDto
            {
                Id = d.DepartmentId,
                Name = d.Name,
                IsActive = d.IsActive
            })
            .ToList();
    }

    public async Task<DepartmentDto> CreateAsync(CreateDepartmentDto dto)
    {
        var department = new Department
        {
            Name = dto.Name,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        await _departmentRepository.AddAsync(department);
        await _departmentRepository.SaveChangesAsync();

        return new DepartmentDto
        {
            Id = department.DepartmentId,
            Name = department.Name,
            IsActive = department.IsActive
        };
    }

    public async Task<DepartmentDto> UpdateAsync(int id, UpdateDepartmentDto dto)
    {
        var department = await _departmentRepository.GetByIdAsync(id);
        if (department is null)
            throw new NotFoundException("Departman bulunamadı.");

        department.Name = dto.Name;
        department.IsActive = dto.IsActive;

        await _departmentRepository.SaveChangesAsync();

        return new DepartmentDto
        {
            Id = department.DepartmentId,
            Name = department.Name,
            IsActive = department.IsActive
        };
    }
}