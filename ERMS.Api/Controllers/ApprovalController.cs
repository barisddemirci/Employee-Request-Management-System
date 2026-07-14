using ERMS.Api.Extensions;
using ERMS.Application.DTOs;
using ERMS.Application.Interfaces;
using ERMS.Application.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERMS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Manager,Admin")]
public class ApprovalsController : ControllerBase
{
    private readonly IApprovalService _approvalService;
    private readonly RejectRequestValidator _rejectValidator;

    public ApprovalsController(
        IApprovalService approvalService,
        RejectRequestValidator rejectValidator)
    {
        _approvalService = approvalService;
        _rejectValidator = rejectValidator;
    }

    [HttpGet("pending")]
    public async Task<IActionResult> GetPending()
    {
        var result = await _approvalService.GetPendingApprovalsAsync(User.GetUserId());
        return Ok(result);
    }

    [HttpPost("{requestId}/approve")]
    public async Task<IActionResult> Approve(int requestId, [FromBody] ApprovalDecisionDto dto)
    {
        var result = await _approvalService.ApproveAsync(requestId, User.GetUserId(), dto.Comment);
        return Ok(result);
    }

    [HttpPost("{requestId}/reject")]
    public async Task<IActionResult> Reject(int requestId, [FromBody] ApprovalDecisionDto dto)
    {
        var validationResult = await _rejectValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
            throw new ValidationException(validationResult.Errors);

        var result = await _approvalService.RejectAsync(requestId, User.GetUserId(), dto.Comment!);
        return Ok(result);
    }
}