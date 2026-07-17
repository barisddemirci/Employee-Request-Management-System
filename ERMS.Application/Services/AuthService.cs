using ERMS.Application.DTOs.Auth;
using ERMS.Application.Exceptions;
using ERMS.Application.Interfaces;
using ERMS.Domain.Entities;
using Microsoft.Extensions.Logging;


namespace ERMS.Application.Services;

public class AuthService : IAuthService
{
    private readonly IRepository<User> _userRepository;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IRepository<User> userRepository, ITokenService tokenService, ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _tokenService = tokenService;
        _logger = logger;
    }

    public async Task<LoginResponseDto> LoginAsync(LoginDto dto)
    {
        var users = await _userRepository.GetAllAsync();
        var user = users.FirstOrDefault(u => u.Email == dto.Email);

        if (user is null)
            throw new UnauthorizedException("E-posta veya parola hatalı.");

        if (!user.IsActive)
            throw new UnauthorizedException("Kullanıcı pasif durumda, giriş yapılamaz.");

        var passwordMatches = BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash);
        if (!passwordMatches)
            throw new UnauthorizedException("E-posta veya parola hatalı.");

        var token = _tokenService.GenerateToken(user, out var expiresAt);

        _logger.LogInformation("Kullanıcı giriş yaptı: {Email} (Id: {UserId})", user.Email, user.UserId);

        return new LoginResponseDto
        {
            Token = token,
            ExpiresAt = expiresAt,
            User = new UserInfoDto
            {
                Id = user.UserId,
                FullName = $"{user.FirstName} {user.LastName}",
                Role = user.Role.ToString()
            }
        };
    }
}