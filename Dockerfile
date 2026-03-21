FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY threshold-tracker/apps/api/ .
RUN dotnet publish -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /app/publish .
ENTRYPOINT ["dotnet", "ThresholdTracker.Api.dll"]
