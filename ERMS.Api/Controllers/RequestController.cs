using ERMS.Api.Extensions;
using ERMS.Application.DTOs.Requests;
using ERMS.Application.Interfaces;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERMS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
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

        var result = await _requestService.CreateAsync(dto, User.GetUserId());

        return Created($"/api/requests/{result.Id}", result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var result = await _requestService.GetByIdAsync(id, User.GetUserId());
        if (result is null)
            return NotFound();

        return Ok(result);
    }

    [HttpPost("{id}/submit")]
    public async Task<IActionResult> Submit(int id)
    {
        var result = await _requestService.SubmitAsync(id, User.GetUserId());
        return Ok(result);
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(int id)
    {
        var result = await _requestService.CancelAsync(id, User.GetUserId());
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyRequests()
    {
        var result = await _requestService.GetMyRequestsAsync(User.GetUserId());
        return Ok(result);
    }
}