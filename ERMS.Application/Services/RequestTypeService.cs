using ERMS.Application.DTOs.RequestType;
using ERMS.Application.Exceptions;
using ERMS.Application.Interfaces;
using ERMS.Domain.Entities;

namespace ERMS.Application.Services;

public class RequestTypeService : IRequestTypeService
{
    private readonly IRepository<RequestType> _requestTypeRepository;

    public RequestTypeService(IRepository<RequestType> requestTypeRepository)
    {
        _requestTypeRepository = requestTypeRepository;
    }

    public async Task<List<RequestTypeDto>> GetAllAsync()
    {
        var types = await _requestTypeRepository.GetAllAsync();

        return types
            .Select(t => new RequestTypeDto
            {
                Id = t.RequestTypeId,
                Name = t.Name,
                RequiresApproval = t.RequiresApproval,
                IsActive = t.IsActive
            })
            .ToList();
    }

    public async Task<RequestTypeDto> CreateAsync(CreateRequestTypeDto dto)
    {
        var type = new RequestType
        {
            Name = dto.Name,
            RequiresApproval = dto.RequiresApproval,
            IsActive = true          // yeni tür her zaman aktif başlar
        };

        await _requestTypeRepository.AddAsync(type);
        await _requestTypeRepository.SaveChangesAsync();

        return new RequestTypeDto
        {
            Id = type.RequestTypeId,
            Name = type.Name,
            RequiresApproval = type.RequiresApproval,
            IsActive = type.IsActive
        };
    }

    public async Task<RequestTypeDto> UpdateAsync(int id, UpdateRequestTypeDto dto)
    {
        var type = await _requestTypeRepository.GetByIdAsync(id);
        if (type is null)
            throw new NotFoundException("Talep türü bulunamadı.");

        type.Name = dto.Name;
        type.RequiresApproval = dto.RequiresApproval;
        type.IsActive = dto.IsActive;

        await _requestTypeRepository.SaveChangesAsync();

        return new RequestTypeDto
        {
            Id = type.RequestTypeId,
            Name = type.Name,
            RequiresApproval = type.RequiresApproval,
            IsActive = type.IsActive
        };
    }
    public async Task<List<RequestTypeDto>> GetActiveAsync()
    {
        var types = await _requestTypeRepository.GetAllAsync();

        return types
            .Where(t => t.IsActive)          // sadece aktif olanlar
            .Select(t => new RequestTypeDto
            {
                Id = t.RequestTypeId,
                Name = t.Name,
                RequiresApproval = t.RequiresApproval,
                IsActive = t.IsActive
            })
            .ToList();
    }

}