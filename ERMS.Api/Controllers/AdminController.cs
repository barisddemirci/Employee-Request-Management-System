using ERMS.Application.DTOs.Admin;
using ERMS.Application.DTOs.Department;
using ERMS.Application.DTOs.RequestType;
using ERMS.Application.Interfaces;
using ERMS.Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERMS.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IRequestTypeService _requestTypeService;
    private readonly IDepartmentService _departmentService;
    private readonly IUserAdminService _userAdminService;

    public AdminController(
        IRequestTypeService requestTypeService,
        IDepartmentService departmentService,
        IUserAdminService userAdminService)
    {

        _requestTypeService = requestTypeService;
        _departmentService = departmentService;
        _userAdminService = userAdminService;
    }

    // ---- Talep Türü Yönetimi (FR-13, 14, 15) ----

    [HttpGet("request-types")]
    public async Task<IActionResult> GetRequestTypes()
    {
        var result = await _requestTypeService.GetAllAsync();
        return Ok(result);
    }

    [HttpPost("request-types")]
    public async Task<IActionResult> CreateRequestType([FromBody] CreateRequestTypeDto dto)
    {
        var result = await _requestTypeService.CreateAsync(dto);
        return Created($"/api/admin/request-types/{result.Id}", result);
    }

    [HttpPut("request-types/{id}")]
    public async Task<IActionResult> UpdateRequestType(int id, [FromBody] UpdateRequestTypeDto dto)
    {
        var result = await _requestTypeService.UpdateAsync(id, dto);
        return Ok(result);
    }
    // ---- Departman Yönetimi (FR-11, 12) ----

    [HttpGet("departments")]
    public async Task<IActionResult> GetDepartments()
    {
        var result = await _departmentService.GetAllAsync();
        return Ok(result);
    }

    [HttpPost("departments")]
    public async Task<IActionResult> CreateDepartment([FromBody] CreateDepartmentDto dto)
    {
        var result = await _departmentService.CreateAsync(dto);
        return Created($"/api/admin/departments/{result.Id}", result);
    }

    [HttpPut("departments/{id}")]
    public async Task<IActionResult> UpdateDepartment(int id, [FromBody] UpdateDepartmentDto dto)
    {
        var result = await _departmentService.UpdateAsync(id, dto);
        return Ok(result);
    }
    // ---- Kullanıcı Yönetimi (FR-07, 08, 09, 10) ----

    [HttpGet("users")]
    public async Task<IActionResult> GetUsers()
    {
        var result = await _userAdminService.GetAllAsync();
        return Ok(result);
    }

    [HttpPost("users")]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
    {
        var result = await _userAdminService.CreateAsync(dto);
        return Created($"/api/admin/users/{result.Id}", result);
    }

    [HttpPut("users/{id}")]
    public async Task<IActionResult> UpdateUser(int id, [FromBody] UpdateUserDto dto)
    {
        var result = await _userAdminService.UpdateAsync(id, dto);
        return Ok(result);
    }
}