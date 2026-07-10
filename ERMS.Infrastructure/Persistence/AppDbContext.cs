using Azure.Core;
using ERMS.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERMS.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<ERMS.Domain.Entities.Department> Departments => Set<ERMS.Domain.Entities.Department>();
    public DbSet<ERMS.Domain.Entities.Request> Requests => Set<ERMS.Domain.Entities.Request>();
    public DbSet<RequestType> RequestTypes => Set<RequestType>();
    public DbSet<Approval> Approvals => Set<Approval>();
    public DbSet<RequestComment> RequestComments => Set<RequestComment>();
    public DbSet<RequestHistory> RequestHistories => Set<RequestHistory>();
}