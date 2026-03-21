namespace ThresholdTracker.Application.Exceptions;

public class DuplicateTaskException(Guid existingId) : Exception("Task name already exists.")
{
    public Guid ExistingTaskId { get; } = existingId;
}
