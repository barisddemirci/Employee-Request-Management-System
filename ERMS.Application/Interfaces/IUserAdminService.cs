using ERMS.Application.DTOs.Admin;

namespace ERMS.Application.Interfaces;

public interface IUserAdminService
{
    Task<List<UserDto>> GetAllAsync();
    Task<UserDto> CreateAsync(CreateUserDto dto);
    Task<UserDto> UpdateAsync(int id, UpdateUserDto dto);
}