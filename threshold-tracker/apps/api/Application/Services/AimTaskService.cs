using ThresholdTracker.Application.DTOs;
using ThresholdTracker.Application.Exceptions;
using ThresholdTracker.Domain.Entities;
using ThresholdTracker.Domain.Enums;
using ThresholdTracker.Domain.Repositories;

namespace ThresholdTracker.Application.Services;

public class AimTaskService(IAimTaskRepository repository) : IAimTaskService
{
    public async Task<PagedResponse<TaskResponse>> GetTasksAsync(int page, int pageSize, CancellationToken ct = default)
    {
        var (items, totalCount) = await repository.GetAllAsync(page, pageSize, ct);
        var hasNextPage = page * pageSize < totalCount;
        return new PagedResponse<TaskResponse>(
            items.Select(ToResponse).ToList(),
            totalCount, page, pageSize, hasNextPage);
    }

    public async Task<TaskResponse> GetTaskAsync(Guid id, CancellationToken ct = default)
    {
        var task = await repository.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Task {id} not found.");
        return ToResponse(task);
    }

    public async Task<TaskResponse> CreateTaskAsync(TaskCreateRequest request, string userId, CancellationToken ct = default)
    {
        var existing = await repository.GetByNameAsync(request.Name, ct);
        if (existing is not null)
            throw new DuplicateTaskException(existing.Id);

        if (!Enum.TryParse<TaskCategory>(request.Category, ignoreCase: true, out var category))
            category = TaskCategory.Other;

        var task = new AimTask
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Category = category,
            Threshold = request.Threshold,
            PersonalBest = request.PersonalBest,
            Notes = request.Notes,
            CreatedDate = DateTime.UtcNow,
            CreatedByUserId = userId
        };

        await repository.AddAsync(task, ct);
        return ToResponse(task);
    }

    public async Task<TaskResponse> UpdateTaskAsync(Guid id, TaskUpdateRequest request, string userId, CancellationToken ct = default)
    {
        var task = await repository.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Task {id} not found.");

        if (task.CreatedByUserId != userId)
            throw new UnauthorizedException("Only the task creator can edit this task.");

        if (request.Category is not null && Enum.TryParse<TaskCategory>(request.Category, ignoreCase: true, out var category))
            task.Category = category;
        if (request.Threshold.HasValue) task.Threshold = request.Threshold;
        if (request.PersonalBest.HasValue) task.PersonalBest = request.PersonalBest;
        if (request.Notes is not null) task.Notes = request.Notes;

        await repository.UpdateAsync(task, ct);
        return ToResponse(task);
    }

    public async Task DeleteTaskAsync(Guid id, string userId, CancellationToken ct = default)
    {
        var task = await repository.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Task {id} not found.");

        if (task.CreatedByUserId != userId)
            throw new UnauthorizedException("Only the task creator can delete this task.");

        await repository.DeleteAsync(task, ct);
    }

    private static TaskResponse ToResponse(AimTask t) =>
        new(t.Id, t.Name, t.Category.ToString().ToLower(), t.Threshold, t.PersonalBest, t.Notes, t.CreatedDate, t.CreatedByUserId);
}
