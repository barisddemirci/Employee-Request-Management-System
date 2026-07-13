using ERMS.Application.Exceptions;

namespace ERMS.Api.Middleware;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionHandlingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (NotFoundException ex)
        {
            await Write(context, 404, new { code = "NOT_FOUND", message = ex.Message });
        }
        catch (ForbiddenException ex)
        {
            await Write(context, 403, new { code = "FORBIDDEN", message = ex.Message });
        }
        catch (ConflictException ex)
        {
            await Write(context, 409, new { code = "CONFLICT", message = ex.Message });
        }
        catch (Exception)
        {
            await Write(context, 500, new { code = "INTERNAL_ERROR", message = "Beklenmeyen bir hata oluştu." });
        }
    }

    private static async Task Write(HttpContext ctx, int status, object body)
    {
        ctx.Response.StatusCode = status;
        ctx.Response.ContentType = "application/json";
        await ctx.Response.WriteAsJsonAsync(body);
    }
}