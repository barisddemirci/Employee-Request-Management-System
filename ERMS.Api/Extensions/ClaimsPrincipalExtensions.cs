using System.Security.Claims;

namespace ERMS.Api.Extensions;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal user)
    {
        var claim = user.FindFirstValue(ClaimTypes.NameIdentifier);

        if (string.IsNullOrEmpty(claim))
            throw new UnauthorizedAccessException("Token içinde kullanıcı kimliği bulunamadı.");

        return int.Parse(claim);
    }
}