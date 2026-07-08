using ERMS.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Text;

namespace ERMS.Domain.Entities
{
    public class Request
    {
        public int RequestId { get; set; }
        public int RequestTypeId { get; set; }
        public int RequesterId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public RequestStatus Status { get; set; }
        public string priority { get; set; } = "Normal";
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public decimal? Amount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

    }
}
