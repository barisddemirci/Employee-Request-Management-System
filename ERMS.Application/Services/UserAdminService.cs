using ERMS.Application.DTOs.Admin;
using ERMS.Application.Exceptions;
using ERMS.Application.Interfaces;
using ERMS.Domain.Entities;

namespace ERMS.Application.Services;

public class UserAdminService : IUserAdminService
{
    private readonly IRepository<User> _userRepository;

    public UserAdminService(IRepository<User> userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<List<UserDto>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();

        return users
            .Select(u => new UserDto
            {
                Id = u.UserId,
                FirstName = u.FirstName,
                LastName = u.LastName,
                Email = u.Email,
                Role = u.Role,
                DepartmentId = u.DepartmentId,
                ManagerId = u.ManagerId,
                IsActive = u.IsActive
            })
            .ToList();
    }

    public async Task<UserDto> CreateAsync(CreateUserDto dto)
    {
        // E-posta zaten kullanılıyor mu? (benzersizlik kontrolü)
        var existingUsers = await _userRepository.GetAllAsync();
        if (existingUsers.Any(u => u.Email == dto.Email))
            throw new ConflictException("Bu e-posta adresi zaten kullanılıyor.");

        var user = new User
        {
            FirstName = dto.FirstName,
            LastName = dto.LastName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),   // ← parola hash'leniyor
            Role = dto.Role,
            DepartmentId = dto.DepartmentId,
            ManagerId = dto.ManagerId,
            IsActive = true
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return MapToDto(user);
    }

    public async Task<UserDto> UpdateAsync(int id, UpdateUserDto dto)
    {
        var user = await _userRepository.GetByIdAsync(id);
        if (user is null)
            throw new NotFoundException("Kullanıcı bulunamadı.");

        user.FirstName = dto.FirstName;
        user.LastName = dto.LastName;
        user.Role = dto.Role;
        user.DepartmentId = dto.DepartmentId;
        user.ManagerId = dto.ManagerId;
        user.IsActive = dto.IsActive;
        // Not: PasswordHash ve Email'e dokunmuyoruz

        await _userRepository.SaveChangesAsync();

        return MapToDto(user);
    }

    // Ortak DTO dönüşümü — tekrarı önlemek için
    private static UserDto MapToDto(User user)
    {
        return new UserDto
        {
            Id = user.UserId,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role,
            DepartmentId = user.DepartmentId,
            ManagerId = user.ManagerId,
            IsActive = user.IsActive
        };
    }
}