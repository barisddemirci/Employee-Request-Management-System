using FluentValidation;
using ERMS.Application.DTOs.Requests;

namespace ERMS.Application.Validators.Requests;

public class CreateRequestValidator : AbstractValidator<CreateRequestDto>
{
    public CreateRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty().WithMessage("Başlık zorunludur.")
            .MaximumLength(200).WithMessage("Başlık en fazla 200 karakter olabilir.");

        RuleFor(x => x.Description)
            .NotEmpty().WithMessage("Açıklama zorunludur.");

        RuleFor(x => x.RequestTypeId)
            .GreaterThan(0).WithMessage("Geçerli bir talep türü seçilmelidir.");

        RuleFor(x => x.EndDate)
            .GreaterThanOrEqualTo(x => x.StartDate)
            .When(x => x.StartDate.HasValue && x.EndDate.HasValue)
            .WithMessage("Bitiş tarihi başlangıçtan önce olamaz.");

        RuleFor(x => x.Amount)
            .GreaterThan(0)
            .When(x => x.Amount.HasValue)
            .WithMessage("Tutar pozitif bir değer olmalıdır.");
    }
}