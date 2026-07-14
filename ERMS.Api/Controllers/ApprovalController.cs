using ERMS.Application.DTOs;
using ERMS.Application.Interfaces;
using ERMS.Application.Validators;
using FluentValidation;
using Microsoft.AspNetCore.Mvc;

namespace ERMS.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
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
        var currentManagerId = 2; // GEÇİCİ — JWT gelene kadar sabit, aşağıda açıklıyorum

        var result = await _approvalService.GetPendingApprovalsAsync(currentManagerId);
        return Ok(result);
    }

    [HttpPost("{requestId}/approve")]
    public async Task<IActionResult> Approve(int requestId, [FromBody] ApprovalDecisionDto dto)
    {
        var currentManagerId = 2; // GEÇİCİ

        var result = await _approvalService.ApproveAsync(requestId, currentManagerId, dto.Comment);
        return Ok(result);
    }

    [HttpPost("{requestId}/reject")]
    public async Task<IActionResult> Reject(int requestId, [FromBody] ApprovalDecisionDto dto)
    {
        var validationResult = await _rejectValidator.ValidateAsync(dto);
        if (!validationResult.IsValid)
             throw new ValidationException(validationResult.Errors);

        var currentManagerId = 2; // GEÇİCİ

        var result = await _approvalService.RejectAsync(requestId, currentManagerId, dto.Comment!);
        return Ok(result);
    }
}