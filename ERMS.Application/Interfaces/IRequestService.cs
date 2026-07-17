using ERMS.Application.DTOs;
using ERMS.Application.DTOs.Requests;

namespace ERMS.Application.Interfaces;

public interface IRequestService
{
    Task<RequestResponseDto> CreateAsync(CreateRequestDto dto, int currentUserId); //currentUserId tokenden alınacak
    Task<RequestResponseDto?> GetByIdAsync(int requestId, int currentUserId);
    Task<PagedResultDto<RequestResponseDto>> GetMyRequestsAsync(int currentUserId, RequestFilterDto filter);
    Task<RequestResponseDto> SubmitAsync(int requestId, int currentUserId);
    Task<RequestResponseDto> CancelAsync(int requestId, int currentUserId);
    Task<RequestDetailDto> GetDetailAsync(int requestId, int currentUserId);
    Task<RequestCommentDto> AddCommentAsync(int requestId, int currentUserId, CreateCommentDto dto);
}