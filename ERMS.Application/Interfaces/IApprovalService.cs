using ERMS.Application.DTOs.Requests;

namespace ERMS.Application.Interfaces;

public interface IApprovalService
{
    Task<List<RequestResponseDto>> GetPendingApprovalsAsync(int managerId);
    Task<RequestResponseDto> ApproveAsync(int requestId, int managerId, string? comment);
    Task<RequestResponseDto> RejectAsync(int requestId, int managerId, string comment);
}