using FluentValidation;
using ERMS.Application.DTOs;

namespace ERMS.Application.Validators;

public class RejectRequestValidator : AbstractValidator<ApprovalDecisionDto>
{
    public RejectRequestValidator()
    {
        RuleFor(x => x.Comment)
            .NotEmpty()
            .WithMessage("Reddetme işleminde gerekçe belirtmek zorunludur.");
    }
}