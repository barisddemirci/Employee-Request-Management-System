using ERMS.Application.DTOs.Requests;
using ERMS.Application.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace ERMS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RequestsController : ControllerBase
{
    private readonly IRequestService _requestService;
    private readonly IValidator<CreateRequestDto> _validator;

    public RequestsController(
        IRequestService requestService,
        IValidator<CreateRequestDto> validator)
    {
        _requestService = requestService;
        _validator = validator;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateRequestDto dto)
    {
        await _validator.ValidateAndThrowAsync(dto);

        // GEÇİCİ: JWT henüz kurulmadı, test için sabit bir kullanıcı id'si kullanıyoruz.
        // JWT kurulunca bu satır token'dan okunan gerçek id ile değişecek.
        var currentUserId = 1;

        var result = await _requestService.CreateAsync(dto, currentUserId);

        return Created($"/api/requests/{result.Id}", result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var currentUserId = 1;   // GEÇİCİ

        var result = await _requestService.GetByIdAsync(id, currentUserId);
        if (result is null)
            return NotFound();

        return Ok(result);
    }
    [HttpPost("{id}/submit")]
    public async Task<IActionResult> Submit(int id)
    {
        var currentUserId = 1; // JWT gelene kadar sabit
        var result = await _requestService.SubmitAsync(id, currentUserId);
        return Ok(result);
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var currentUserId = 1; // JWT gelene kadar sabit
        var result = await _requestService.CancelAsync(id, currentUserId);
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyRequests()
    {
        var currentUserId = 1;   // GEÇİCİ

        var result = await _requestService.GetMyRequestsAsync(currentUserId);
        return Ok(result);
    }
}