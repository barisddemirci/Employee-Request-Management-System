using ERMS.Application.DTOs.Requests;

namespace ERMS.Application.Interfaces;

public interface IRequestService
{
    Task<RequestResponseDto> CreateAsync(CreateRequestDto dto, int currentUserId); //currentUserId tokenden alınacak
    Task<RequestResponseDto?> GetByIdAsync(int requestId, int currentUserId);
    Task<List<RequestResponseDto>> GetMyRequestsAsync(int currentUserId);
}