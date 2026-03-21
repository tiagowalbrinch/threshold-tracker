using Microsoft.AspNetCore.Identity;
using ThresholdTracker.Application.DTOs;
using ThresholdTracker.Application.Exceptions;
using ThresholdTracker.Domain.Entities;
using ThresholdTracker.Domain.Identity;
using ThresholdTracker.Domain.Repositories;

namespace ThresholdTracker.Application.Services;

public class ScoreAttemptService(
    IScoreAttemptRepository scoreRepository,
    IAimTaskRepository taskRepository,
    UserManager<ApplicationUser> userManager) : IScoreAttemptService
{
    public async Task<IReadOnlyList<ScoreResponse>> GetScoresAsync(Guid taskId, string? userId, CancellationToken ct = default)
    {
        var scores = userId is not null
            ? await scoreRepository.GetByTaskAndUserAsync(taskId, userId, ct)
            : await scoreRepository.GetByTaskIdAsync(taskId, ct);
        return scores.Select(ToResponse).ToList();
    }

    public async Task<ScoreResponse> AddScoreAsync(ScoreCreateRequest request, string userId, CancellationToken ct = default)
    {
        var task = await taskRepository.GetByIdAsync(request.TaskId, ct)
            ?? throw new KeyNotFoundException($"Task {request.TaskId} not found.");

        var user = await userManager.FindByIdAsync(userId);
        var sensitivity = request.Sensitivity ?? user?.DefaultSensitivity;
        var fov = request.Fov ?? user?.DefaultFov;
        var dpi = request.Dpi ?? user?.DefaultDpi;

        var isPb = task.PersonalBest is null || request.Value > task.PersonalBest;

        var entry = new ScoreAttempt
        {
            Id = Guid.NewGuid(),
            TaskId = request.TaskId,
            Value = request.Value,
            IsPb = isPb,
            Sensitivity = sensitivity,
            Fov = fov,
            Dpi = dpi,
            Notes = request.Notes,
            CreatedDate = DateTime.UtcNow,
            UserId = userId
        };

        await scoreRepository.AddAsync(entry, ct);

        if (isPb)
        {
            task.PersonalBest = request.Value;
            await taskRepository.UpdateAsync(task, ct);
        }

        return ToResponse(entry);
    }

    public async Task DeleteScoreAsync(Guid id, string userId, CancellationToken ct = default)
    {
        var score = await scoreRepository.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException($"Score {id} not found.");

        if (score.UserId != userId)
            throw new UnauthorizedException("Only the score owner can delete this score.");

        await scoreRepository.DeleteAsync(score, ct);
    }

    private static ScoreResponse ToResponse(ScoreAttempt s) =>
        new(s.Id, s.TaskId, s.Value, s.IsPb, s.Sensitivity, s.Fov, s.Dpi, s.Notes, s.CreatedDate, s.UserId);
}
