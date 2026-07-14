using ERMS.Application.DTOs.Auth;

namespace ERMS.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponseDto> LoginAsync(LoginDto dto); //BURAYI İNCELE BURDA KALDIN AÇIKLAMAYA BAK
}