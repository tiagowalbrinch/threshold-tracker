using System.Net.Http.Json;
using System.Text.Json;
using ThresholdTracker.Application.Services;

namespace ThresholdTracker.Infrastructure.AimTrainers;

public sealed class AimlabsClient(HttpClient http) : IAimTrainerClient
{
    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public string TrainerName => "aimlabs";

    public async Task<string?> ResolveUserIdAsync(string username, CancellationToken ct = default)
    {
        var body = new
        {
            query = """
                query GetUserProfile($username: String!) {
                  aimlabProfile(username: $username) {
                    id
                  }
                }
                """,
            variables = new { username }
        };

        var response = await http.PostAsJsonAsync("", body, ct);
        response.EnsureSuccessStatusCode();

        using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(ct), cancellationToken: ct);
        var id = doc.RootElement
            .GetProperty("data")
            .GetProperty("aimlabProfile")
            .GetProperty("id")
            .GetString();

        return id;
    }

    public async Task<IReadOnlyList<TaskStat>> GetTaskStatsAsync(string aimlabUserId, CancellationToken ct = default)
    {
        var body = new
        {
            query = """
                query GetUserPlays($userId: String!) {
                  aimlab {
                    plays_agg(where: {
                      is_practice: { _eq: false },
                      score: { _gt: 0 },
                      user_id: { _eq: $userId }
                    }) {
                      group_by {
                        task_id
                        task_name
                        task_mode
                      }
                      aggregate {
                        count
                        avg { score }
                        max { score created_at }
                      }
                    }
                  }
                }
                """,
            variables = new { userId = aimlabUserId }
        };

        var response = await http.PostAsJsonAsync("", body, ct);
        response.EnsureSuccessStatusCode();

        using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(ct), cancellationToken: ct);

        var results = new List<TaskStat>();
        if (!doc.RootElement.TryGetProperty("data", out var data)) return results;
        if (!data.TryGetProperty("aimlab", out var aimlab) || aimlab.ValueKind == JsonValueKind.Null) return results;
        if (!aimlab.TryGetProperty("plays_agg", out var playsAgg) || playsAgg.ValueKind == JsonValueKind.Null) return results;

        foreach (var entry in playsAgg.EnumerateArray())
        {
            var groupBy = entry.GetProperty("group_by");
            var agg = entry.GetProperty("aggregate");

            var taskId = groupBy.GetProperty("task_id").GetString() ?? "";
            var taskName = groupBy.GetProperty("task_name").GetString() ?? taskId;
            // task_mode is a numeric enum in the Aimlabs API — map to our category strings
            var taskModeEl = groupBy.GetProperty("task_mode");
            var category = taskModeEl.ValueKind == JsonValueKind.Number
                ? MapTaskMode(taskModeEl.GetInt32())
                : taskModeEl.GetString() ?? "other";
            var playCount = agg.GetProperty("count").GetInt32();
            var avgScore = agg.GetProperty("avg").GetProperty("score").ValueKind == JsonValueKind.Null
                ? (double?)null
                : agg.GetProperty("avg").GetProperty("score").GetDouble();
            var pb = agg.GetProperty("max").GetProperty("score").ValueKind == JsonValueKind.Null
                ? (int?)null
                : agg.GetProperty("max").GetProperty("score").GetInt32();
            DateTime? lastPlayed = null;
            if (agg.GetProperty("max").TryGetProperty("created_at", out var createdAt)
                && createdAt.ValueKind != JsonValueKind.Null)
            {
                lastPlayed = createdAt.GetDateTime();
            }

            results.Add(new TaskStat(taskId, taskName, category, pb, playCount, avgScore, lastPlayed));
        }

        return results;
    }

    public async Task<IReadOnlyList<PlayAttempt>> GetPlaysAsync(
        string aimlabUsername, string taskId, DateTime? from, DateTime? to, CancellationToken ct = default)
    {
        var results = new List<PlayAttempt>();

        var body = new
        {
            query = """
                query getUserTaskIdPlays($filter: PlayFilterInput, $username: String) {
                  aimlabProfile(username: $username) {
                    plays(filter: $filter) {
                      edges {
                        node {
                          score
                          endedAt
                        }
                      }
                    }
                  }
                }
                """,
            variables = new
            {
                username = aimlabUsername,
                filter = new { taskId }
            }
        };

        var response = await http.PostAsJsonAsync("", body, ct);
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            throw new HttpRequestException($"Aimlabs plays query failed ({response.StatusCode}): {errorBody}");
        }

        using var doc = await JsonDocument.ParseAsync(await response.Content.ReadAsStreamAsync(ct), cancellationToken: ct);

        if (!doc.RootElement.TryGetProperty("data", out var data)) return results;
        if (!data.TryGetProperty("aimlabProfile", out var profile) || profile.ValueKind == JsonValueKind.Null) return results;
        if (!profile.TryGetProperty("plays", out var plays) || plays.ValueKind == JsonValueKind.Null) return results;
        if (!plays.TryGetProperty("edges", out var edges) || edges.ValueKind == JsonValueKind.Null) return results;

        foreach (var edge in edges.EnumerateArray())
        {
            var node = edge.GetProperty("node");
            var score = node.GetProperty("score").GetInt32();
            var playedAt = node.GetProperty("endedAt").GetDateTime();
            results.Add(new PlayAttempt(taskId, score, playedAt));
        }

        return results;
    }

    private static string MapTaskMode(int mode) => mode switch
    {
        10 => "clicking",
        11 => "tracking",
        12 => "flicking",
        13 => "switching",
        15 => "switching",
        _ => "other"
    };
}
