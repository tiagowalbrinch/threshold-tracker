using ThresholdTracker.Application.DTOs;

namespace ThresholdTracker.Application.Validation;

public interface IMapValidator
{
    void ValidateForCreate(MapCreateRequest request);
    void ValidateForUpdate(MapUpdateRequest request, int? existingRecord);
}

