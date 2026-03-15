using ThresholdTracker.Application.DTOs;

namespace ThresholdTracker.Application.Validation;

public class MapValidator : IMapValidator
{
    public void ValidateForCreate(MapCreateRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
        {
            throw new ArgumentException("Name is required.", nameof(request.Name));
        }

        if (request.Threshold <= 0)
        {
            throw new ArgumentException("Threshold must be positive.", nameof(request.Threshold));
        }

        if (request.Record.HasValue && request.Threshold >= request.Record.Value)
        {
            throw new ArgumentException("Threshold must be lower than record when record exists.");
        }
    }

    public void ValidateForUpdate(MapUpdateRequest request, int? existingRecord)
    {
        int? record = request.Record ?? existingRecord;
        int? threshold = request.Threshold;

        if (threshold.HasValue && threshold.Value <= 0)
        {
            throw new ArgumentException("Threshold must be positive.", nameof(request.Threshold));
        }

        if (record.HasValue && threshold.HasValue && threshold.Value >= record.Value)
        {
            throw new ArgumentException("Threshold must be lower than record when record exists.");
        }
    }
}

