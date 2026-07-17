using ERMS.Application.DTOs.RequestType;

namespace ERMS.Application.Interfaces;

public interface IRequestTypeService
{
    Task<List<RequestTypeDto>> GetAllAsync();
    Task<RequestTypeDto> CreateAsync(CreateRequestTypeDto dto);
    Task<RequestTypeDto> UpdateAsync(int id, UpdateRequestTypeDto dto);
    Task<List<RequestTypeDto>> GetActiveAsync();
}