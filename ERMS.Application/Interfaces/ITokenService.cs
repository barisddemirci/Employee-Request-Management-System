using ERMS.Domain.Entities;

namespace ERMS.Application.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user, out DateTime expiresAt);
}