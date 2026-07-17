using ERMS.Application.DTOs;
using ERMS.Application.DTOs.Requests;
using ERMS.Application.Exceptions;
using ERMS.Application.Interfaces;
using ERMS.Domain.Entities;
using ERMS.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ERMS.Application.Services;

public class RequestService : IRequestService
{
    private readonly IRepository<Request> _requestRepository;
    private readonly IRepository<RequestType> _requestTypeRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<RequestHistory> _historyRepository;
    private readonly IRepository<RequestComment> _commentRepository;

    public RequestService(
        IRepository<Request> requestRepository,
        IRepository<RequestType> requestTypeRepository,
        IRepository<User> userRepository,
        IRepository<RequestHistory> historyRepository,
        IRepository<RequestComment> commentRepository)
    {
        _requestRepository = requestRepository;
        _requestTypeRepository = requestTypeRepository;
        _userRepository = userRepository;
        _historyRepository = historyRepository;
        _commentRepository = commentRepository;
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

    public async Task<PagedResultDto<RequestResponseDto>> GetMyRequestsAsync(int currentUserId, RequestFilterDto filter)
    {
        // 1) Sorgunun tarifini kur — henüz DB'ye gitmiyor
        var query = _requestRepository.Query()
            .Where(r => r.RequesterId == currentUserId);

        // 2) Filtreleri koşullu olarak ekle (sadece dolu olanları)
        if (filter.Status.HasValue)
            query = query.Where(r => r.Status == filter.Status.Value);

        if (filter.RequestTypeId.HasValue)
            query = query.Where(r => r.RequestTypeId == filter.RequestTypeId.Value);

        if (!string.IsNullOrWhiteSpace(filter.Search))
            query = query.Where(r => r.Title.Contains(filter.Search));

        // 3) Toplam sayıyı al (sayfalamadan ÖNCE, filtrelenmiş haliyle)
        var totalCount = await query.CountAsync();

        // 4) Sırala + sayfala, sonra DB'den çek
        var pagedRequests = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((filter.Page - 1) * filter.PageSize)
            .Take(filter.PageSize)
            .ToListAsync();

        // 5) Her talep için DTO kur
        var items = new List<RequestResponseDto>();
        foreach (var request in pagedRequests)
        {
            var type = await _requestTypeRepository.GetByIdAsync(request.RequestTypeId);
            var requester = await _userRepository.GetByIdAsync(request.RequesterId);
            var requesterName = requester is null
                ? string.Empty
                : $"{requester.FirstName} {requester.LastName}";

            items.Add(new RequestResponseDto
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

        // 6) Sayfalı sonucu döndür
        return new PagedResultDto<RequestResponseDto>
        {
            Page = filter.Page,
            PageSize = filter.PageSize,
            TotalCount = totalCount,
            Items = items
        };
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
    public async Task<RequestDetailDto> GetDetailAsync(int requestId, int currentUserId)
    {
        var request = await _requestRepository.GetByIdAsync(requestId);
        if (request is null)
            throw new NotFoundException("Talep bulunamadı.");

        // Sahiplik kontrolü (FR-26) — şimdilik sadece sahibi görebilir
        if (request.RequesterId != currentUserId)
            throw new ForbiddenException("Bu talebi görüntüleme yetkiniz yok.");

        var type = await _requestTypeRepository.GetByIdAsync(request.RequestTypeId);
        var requester = await _userRepository.GetByIdAsync(request.RequesterId);
        var requesterName = requester is null
            ? string.Empty
            : $"{requester.FirstName} {requester.LastName}";

        // --- Yorumları çek ---
        var allComments = await _commentRepository.GetAllAsync();
        var commentsForRequest = allComments
            .Where(c => c.RequestId == requestId)
            .OrderBy(c => c.CreatedAt)
            .ToList();

        var commentDtos = new List<RequestCommentDto>();
        foreach (var comment in commentsForRequest)
        {
            var author = await _userRepository.GetByIdAsync(comment.AuthorId);
            commentDtos.Add(new RequestCommentDto
            {
                Id = comment.RequestCommentId,
                AuthorName = author is null ? string.Empty : $"{author.FirstName} {author.LastName}",
                Content = comment.Content,
                CreatedAt = comment.CreatedAt
            });
        }

        // --- Geçmişi çek ---
        var allHistory = await _historyRepository.GetAllAsync();
        var historyForRequest = allHistory
            .Where(h => h.RequestId == requestId)
            .OrderBy(h => h.ChangedAt)
            .ToList();

        var historyDtos = new List<RequestHistoryDto>();
        foreach (var h in historyForRequest)
        {
            var changedBy = await _userRepository.GetByIdAsync(h.ChangedById);
            historyDtos.Add(new RequestHistoryDto
            {
                Id = h.RequestHistoryId,
                ChangedByName = changedBy is null ? string.Empty : $"{changedBy.FirstName} {changedBy.LastName}",
                OldStatus = h.OldStatus?.ToString(),
                NewStatus = h.NewStatus.ToString(),
                ChangedAt = h.ChangedAt
            });
        }

        // --- Hepsini birleştir ---
        return new RequestDetailDto
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
            RequesterName = requesterName,
            Comments = commentDtos,
            History = historyDtos
        };
    }
    public async Task<RequestCommentDto> AddCommentAsync(int requestId, int currentUserId, CreateCommentDto dto)
    {
        // 1) Talep var mı?
        var request = await _requestRepository.GetByIdAsync(requestId);
        if (request is null)
            throw new NotFoundException("Talep bulunamadı.");

        // 2) Yorum ekleme yetkisi: talep sahibi VEYA o talebin sahibinin yöneticisi (FR-38)
        var requester = await _userRepository.GetByIdAsync(request.RequesterId);
        var isOwner = request.RequesterId == currentUserId;
        var isManagerOfOwner = requester is not null && requester.ManagerId == currentUserId;

        if (!isOwner && !isManagerOfOwner)
            throw new ForbiddenException("Bu talebe yorum ekleme yetkiniz yok.");

        // 3) Yorumu oluştur ve kaydet
        var comment = new RequestComment
        {
            RequestId = requestId,
            AuthorId = currentUserId,
            Content = dto.Content,
            CreatedAt = DateTime.UtcNow
        };

        await _commentRepository.AddAsync(comment);
        await _commentRepository.SaveChangesAsync();

        // 4) Yazarın adını çekip DTO dön
        var author = await _userRepository.GetByIdAsync(currentUserId);
        return new RequestCommentDto
        {
            Id = comment.RequestCommentId,
            AuthorName = author is null ? string.Empty : $"{author.FirstName} {author.LastName}",
            Content = comment.Content,
            CreatedAt = comment.CreatedAt
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