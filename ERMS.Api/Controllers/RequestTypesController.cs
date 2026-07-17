using ERMS.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERMS.Api.Controllers;

[ApiController]
[Route("api/request-types")]
[Authorize]
public class RequestTypesController : ControllerBase
{
    private readonly IRequestTypeService _requestTypeService;

    public RequestTypesController(IRequestTypeService requestTypeService)
    {
        _requestTypeService = requestTypeService;
    }

    [HttpGet]
    public async Task<IActionResult> GetActive()
    {
        var result = await _requestTypeService.GetActiveAsync();
        return Ok(result);
    }
}