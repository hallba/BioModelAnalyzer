# Task T043: Create Dockerfile

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 30m
**Dependencies:** T014
**Phase:** Phase 11 - Polish & Deployment

---

## Implementation

Create `src/BmaLinuxApi/Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0-alpine AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore "src/BmaLinuxApi/BmaLinuxApi.csproj"
RUN dotnet publish "src/BmaLinuxApi/BmaLinuxApi.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=build /app/publish .
ENV ASPNETCORE_URLS=http://+:8080
ENTRYPOINT ["dotnet", "BmaLinuxApi.dll"]
```

Create `.dockerignore`:
```
**/bin
**/obj
**/.git
**/node_modules
```

Test:
```bash
docker build -t bma-linux -f src/BmaLinuxApi/Dockerfile .
docker run -p 8080:8080 bma-linux
```

- [ ] Create Dockerfile
- [ ] Create .dockerignore
- [ ] Test docker build

---

**Created:** 2026-01-29
