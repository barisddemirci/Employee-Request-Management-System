using ERMS.Application.DTOs.Requests;
using ERMS.Application.Interfaces;
using ERMS.Domain.Entities;
using ERMS.Domain.Enums;
using ERMS.Application.Exceptions;

namespace ERMS.Application.Services;

public class RequestService : IRequestService
{
    private readonly IRepository<Request> _requestRepository;
    private readonly IRepository<RequestType> _requestTypeRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<RequestHistory> _historyRepository;

    public RequestService(
        IRepository<Request> requestRepository,
        IRepository<RequestType> requestTypeRepository,
        IRepository<User> userRepository,
        IRepository<RequestHistory> historyRepository)
    {
        _requestRepository = requestRepository;
        _requestTypeRepository = requestTypeRepository;
        _userRepository = userRepository;
        _historyRepository = historyRepository;
    }

    public async Task<RequestResponseDto> CreateAsync(CreateRequestDto dto, int currentUserId)
    {
        // 1) Talep türü gerçekten var mı ve aktif mi?
        var type = await _requestTypeRepository.GetByIdAsync(dto.RequestTypeId);
        if (type is null || !type.IsActive)
            throw new NotFoundException("Geçersiz veya pasif bir talep türü seçildi.");

        
        // 2) DTO'dan Domain entity'sini kuruyoruz
        var request = new Request
        {
            RequestTypeId = dto.RequestTypeId,
            RequesterId = currentUserId,
            Title = dto.Title,
            Description = dto.Description,
            StartDate = dto.StartDate,
            EndDate = dto.EndDate,
            Amount = dto.Amount,
            Priority = dto.Priority,
            CreatedAt = DateTime.UtcNow
        };

        // 3) Durumu belirliyoruz — asıl iş kuralı burada
        if (dto.SaveAsDraft)
        {
            request.Status = RequestStatus.Draft;
        }
        else if (type.RequiresApproval)
        {
            request.Status = RequestStatus.Pending;
        }
        else
        {
            request.Status = RequestStatus.Approved;
        }

        // 4) Kaydet
        await _requestRepository.AddAsync(request);
        await _requestRepository.SaveChangesAsync();

        // 5) Talebi oluşturan kullanıcının adını çek
        var requester = await _userRepository.GetByIdAsync(currentUserId);
        var requesterName = requester is null
            ? string.Empty
            : $"{requester.FirstName} {requester.LastName}";

        // 6) Cevap DTO'sunu hazırlayıp dön
        return new RequestResponseDto
        {
            Id = request.RequestId,
            Title = request.Title,
            Description = request.Description,
            Type = type.Name,
            Status = request.Status.ToString(),
            Priority = request.Priority,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Amount = request.Amount,
            CreatedAt = request.CreatedAt,
            RequesterName = requesterName   // ← artık gerçek isim
        };
    }

    public async Task<RequestResponseDto?> GetByIdAsync(int requestId, int currentUserId)
    {
        var request = await _requestRepository.GetByIdAsync(requestId);
        if (request is null)
            return null;

        // Şimdilik basit bir sahiplik kontrolü: sadece kendi talebini görebilir (FR-26)
        if (request.RequesterId != currentUserId)
            throw new ForbiddenException("Bu talebi görüntüleme yetkiniz yok.");

        var type = await _requestTypeRepository.GetByIdAsync(request.RequestTypeId);
        var requester = await _userRepository.GetByIdAsync(request.RequesterId);
        var requesterName = requester is null
            ? string.Empty
            : $"{requester.FirstName} {requester.LastName}";

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
            RequesterName = requesterName
        };
    }

    public async Task<List<RequestResponseDto>> GetMyRequestsAsync(int currentUserId)
    {
        var allRequests = await _requestRepository.GetAllAsync();
        var myRequests = allRequests.Where(r => r.RequesterId == currentUserId).ToList();

        var result = new List<RequestResponseDto>();

        foreach (var request in myRequests)
        {
            var type = await _requestTypeRepository.GetByIdAsync(request.RequestTypeId);
            var requester = await _userRepository.GetByIdAsync(request.RequesterId);
            var requesterName = requester is null
                ? string.Empty
                : $"{requester.FirstName} {requester.LastName}";
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
                RequesterName = requesterName
            });
        }

        return result;
    }
    public async Task<RequestResponseDto> SubmitAsync(int requestId, int currentUserId)
    {
        var request = await _requestRepository.GetByIdAsync(requestId);
        if (request is null)
            throw new NotFoundException("Talep bulunamadı.");

        if (request.RequesterId != currentUserId)
            throw new ForbiddenException("Bu talebi gönderme yetkiniz yok.");

        if (request.Status != RequestStatus.Draft)
            throw new ConflictException("Yalnızca taslak durumundaki talepler gönderilebilir.");

        var oldStatus = request.Status;

        var type = await _requestTypeRepository.GetByIdAsync(request.RequestTypeId);
        request.Status = (type is not null && type.RequiresApproval)
            ? RequestStatus.Pending
            : RequestStatus.Approved;

        request.UpdatedAt = DateTime.UtcNow;
        await _requestRepository.SaveChangesAsync();

        await LogHistoryAsync(requestId, currentUserId, oldStatus, request.Status);

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
    public async Task<RequestResponseDto> CancelAsync(int requestId, int currentUserId)
    {
        var request = await _requestRepository.GetByIdAsync(requestId);
        if (request is null)
            throw new NotFoundException("Talep bulunamadı.");

        if (request.RequesterId != currentUserId)
            throw new ForbiddenException("Bu talebi iptal etme yetkiniz yok.");

        if (request.Status != RequestStatus.Pending)
            throw new ConflictException("Yalnızca beklemedeki talepler iptal edilebilir.");

        var oldStatus = request.Status;
        request.Status = RequestStatus.Cancelled;
        request.UpdatedAt = DateTime.UtcNow;
        await _requestRepository.SaveChangesAsync();

        await LogHistoryAsync(requestId, currentUserId, oldStatus, request.Status);

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
}