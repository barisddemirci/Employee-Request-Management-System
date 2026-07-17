using ERMS.Application.DTOs;
using ERMS.Application.DTOs.Requests;
using ERMS.Application.Exceptions;
using ERMS.Application.Interfaces;
using ERMS.Domain.Entities;
using ERMS.Domain.Enums;
using Microsoft.Extensions.Logging;

namespace ERMS.Application.Services;

public class ApprovalService : IApprovalService
{
    private readonly IRepository<Request> _requestRepository;
    private readonly IRepository<RequestType> _requestTypeRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<Approval> _approvalRepository;
    private readonly IRepository<RequestHistory> _historyRepository;
    private readonly ILogger<ApprovalService> _logger;

    public ApprovalService(
        IRepository<Request> requestRepository,
        IRepository<RequestType> requestTypeRepository,
        IRepository<User> userRepository,
        IRepository<Approval> approvalRepository,
        IRepository<RequestHistory> historyRepository,
        ILogger<ApprovalService> logger)
    {
        _requestRepository = requestRepository;
        _requestTypeRepository = requestTypeRepository;
        _userRepository = userRepository;
        _approvalRepository = approvalRepository;
        _historyRepository = historyRepository;
        _logger = logger;
    }

    public async Task<List<RequestResponseDto>> GetPendingApprovalsAsync(int managerId)
    {
        var allRequests = await _requestRepository.GetAllAsync();
        var pendingRequests = allRequests.Where(r => r.Status == RequestStatus.Pending).ToList();

        var result = new List<RequestResponseDto>();

        foreach (var request in pendingRequests)
        {
            var requester = await _userRepository.GetByIdAsync(request.RequesterId);

            // Sadece bu manager'a bağlı personelin talepleri listeye girsin
            if (requester is null || requester.ManagerId != managerId)
                continue;

            var type = await _requestTypeRepository.GetByIdAsync(request.RequestTypeId);
            result.Add(new RequestResponseDto
            {
                Id = request.RequestId,
                Title = request.Title,
                Description = request.Description,
                Type = type?.Name ?? string.Empty,
                Status = request.Status.ToString(),
                Priority = request.Priority,
                StartDate = request.StartDate,
                EndDate = request.EndDate,
                Amount = request.Amount,
                CreatedAt = request.CreatedAt,
                RequesterName = $"{requester.FirstName} {requester.LastName}"
            });
        }

        return result;
    }

    public async Task<RequestResponseDto> ApproveAsync(int requestId, int managerId, string? comment)
    {
        var request = await ValidateAndGetPendingRequestAsync(requestId, managerId);

        var oldStatus = request.Status;
        request.Status = RequestStatus.Approved;
        request.UpdatedAt = DateTime.UtcNow;
        await _requestRepository.SaveChangesAsync();

        _logger.LogInformation("Talep onaylandı: {RequestId}, onaylayan: {ManagerId}", requestId, managerId);

        await CreateApprovalRecordAsync(requestId, managerId, "Approved", comment);
        await LogHistoryAsync(requestId, managerId, oldStatus, request.Status);

        return await BuildResponseDtoAsync(request);
    }

    public async Task<RequestResponseDto> RejectAsync(int requestId, int managerId, string comment)
    {
        var request = await ValidateAndGetPendingRequestAsync(requestId, managerId);

        var oldStatus = request.Status;
        request.Status = RequestStatus.Rejected;
        request.UpdatedAt = DateTime.UtcNow;
        await _requestRepository.SaveChangesAsync();

        _logger.LogInformation("Talep reddedildi: {RequestId}, reddeden: {ManagerId}", requestId, managerId);

        await CreateApprovalRecordAsync(requestId, managerId, "Rejected", comment);
        await LogHistoryAsync(requestId, managerId, oldStatus, request.Status);

        return await BuildResponseDtoAsync(request);
    }

    // ---- Ortak yardımcı metotlar (private) ----

    private async Task<Request> ValidateAndGetPendingRequestAsync(int requestId, int managerId)
    {
        var request = await _requestRepository.GetByIdAsync(requestId);
        if (request is null)
            throw new NotFoundException("Talep bulunamadı.");

        if (request.Status != RequestStatus.Pending)
            throw new ConflictException("Yalnızca beklemedeki talepler onaylanabilir/reddedilebilir.");

        if (request.RequesterId == managerId)
            throw new ForbiddenException("Kendi oluşturduğunuz talebi onaylayamazsınız.");

        var requester = await _userRepository.GetByIdAsync(request.RequesterId);
        if (requester is null || requester.ManagerId != managerId)
            throw new ForbiddenException("Bu talebi onaylama/reddetme yetkiniz yok.");

        return request;
    }

    private async Task CreateApprovalRecordAsync(int requestId, int approverId, string decision, string? comment)
    {
        var approval = new Approval
        {
            RequestId = requestId,
            ApproverId = approverId,
            Decision = decision,
            Comment = comment,
            DecidedAt = DateTime.UtcNow
        };

        await _approvalRepository.AddAsync(approval);
        await _approvalRepository.SaveChangesAsync();
    }

    private async Task LogHistoryAsync(int requestId, int changedById, RequestStatus oldStatus, RequestStatus newStatus)
    {
        var history = new RequestHistory
        {
            RequestId = requestId,
            ChangedById = changedById,
            OldStatus = oldStatus,
            NewStatus = newStatus,
            ChangedAt = DateTime.UtcNow
        };

        await _historyRepository.AddAsync(history);
        await _historyRepository.SaveChangesAsync();
    }

    private async Task<RequestResponseDto> BuildResponseDtoAsync(Request request)
    {
        var type = await _requestTypeRepository.GetByIdAsync(request.RequestTypeId);
        var requester = await _userRepository.GetByIdAsync(request.RequesterId);

        return new RequestResponseDto
        {
            Id = request.RequestId,
            Title = request.Title,
            Description = request.Description,
            Type = type?.Name ?? string.Empty,
            Status = request.Status.ToString(),
            Priority = request.Priority,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Amount = request.Amount,
            CreatedAt = request.CreatedAt,
            RequesterName = requester is null ? string.Empty : $"{requester.FirstName} {requester.LastName}"
        };
    }
}