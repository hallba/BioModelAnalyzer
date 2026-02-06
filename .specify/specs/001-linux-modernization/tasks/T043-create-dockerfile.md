# Task T043: Create Dockerfile

**Status:** [ ] Pending | [ ] In Progress | [ ] Complete
**Effort:** 30m
**Dependencies:** T014
**Phase:** Phase 11 - Polish & Deployment

---

## Context Setup Prompt

```
I'm working on Task T043: Create Dockerfile.

Read: .specify/specs/001-linux-modernization/tasks/T043-create-dockerfile.md
      src/BmaLinuxApi/BmaLinuxApi.csproj

## Goal

Create a multi-stage Dockerfile and .dockerignore for BmaLinuxApi.
Use runtime-deps:8.0-noble-chiseled-extra as the runtime base image
(see Security Justification notes in the task for rationale).
The app publishes as self-contained single-file, so entrypoint is
the executable directly, not `dotnet BmaLinuxApi.dll`.
```

---

## Implementation

Create `src/BmaLinuxApi/Dockerfile`:

```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN dotnet restore "src/BmaLinuxApi/BmaLinuxApi.csproj"
RUN dotnet publish "src/BmaLinuxApi/BmaLinuxApi.csproj" \
    -c Release -r linux-x64 -o /app/publish

FROM mcr.microsoft.com/dotnet/runtime-deps:8.0-noble-chiseled-extra AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8020
ENV ASPNETCORE_URLS=http://+:8020
ENTRYPOINT ["./BmaLinuxApi"]
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
docker run -p 8020:8020 bma-linux
```

- [ ] Create Dockerfile
- [ ] Create .dockerignore
- [ ] Test docker build
- [ ] Verify low/zero CVEs with Trivy or Docker Scout

---

## Notes

This task creates the production Dockerfile. For development builds without local SDK, use:
- `./scripts/dotnet-docker.sh build src/BmaLinuxApi`
- See [quickstart.md](../quickstart.md#building-with-docker-no-local-sdk) for details

### Base Image Selection: Security Justification

The original spec used `aspnet:8.0-alpine`. This was revised after analysis of security posture and native library compatibility.

**Two problems with the original choice:**

1. **Alpine uses musl, not glibc.** Z3's native `libz3.so` is linked against glibc and will not load on Alpine. This would cause runtime `DllNotFoundException` failures.
2. **Full `aspnet:8.0` (Debian) is not acceptable either** — Trivy/Docker Scout scans report hundreds of HIGH/CRITICAL CVEs from the large Debian package set.

**Chosen image: `runtime-deps:8.0-noble-chiseled-extra`**

Since `BmaLinuxApi.csproj` already publishes as self-contained + single-file (`PublishSingleFile=true`, `SelfContained=true`), the .NET runtime is bundled into the executable. The container only needs the native OS dependencies — not the full ASP.NET runtime. This is exactly what `runtime-deps` provides.

The `-extra` variant is required because it includes `libstdc++`, which Z3 (a C++ library) depends on. The base `noble-chiseled` variant omits `libstdc++`.

| Image | Base OS | glibc | Shell | Pkg Mgr | Typical CVEs | Approx Size |
|-------|---------|-------|-------|---------|--------------|-------------|
| `aspnet:8.0` | Debian | yes | yes | yes | Many HIGH/CRIT | ~220MB |
| `aspnet:8.0-alpine` | Alpine | no (musl) | yes | yes | Few | ~50MB |
| `aspnet:8.0-noble-chiseled` | Ubuntu 24.04 | yes | no | no | 0-2 LOW | ~13MB |
| **`runtime-deps:8.0-noble-chiseled-extra`** | Ubuntu 24.04 | yes | no | no | 0-2 LOW | ~13MB |

**Security properties of the chosen image:**
- **No shell** — eliminates shell-based exploit chains
- **No package manager** — prevents runtime package installation by attackers
- **Non-root by default** — runs as `app` user (UID 1654), no `USER` directive needed
- **Minimal package set** — only glibc, OpenSSL, libstdc++, and ICU/tzdata

**Entrypoint change:** Because the app is self-contained, the entrypoint is `["./BmaLinuxApi"]` (direct executable) rather than `["dotnet", "BmaLinuxApi.dll"]`.

**Fallback:** If Z3 fails to load on `noble-chiseled-extra`, use `aspnet:8.0-noble-chiseled` (still distroless/no-shell, just includes the full .NET runtime as well).

**References:**
- [Secure your container build and publish with .NET 8 - Microsoft](https://devblogs.microsoft.com/dotnet/secure-your-container-build-and-publish-with-dotnet-8/)
- [Announcing .NET Chiseled Containers - Microsoft](https://devblogs.microsoft.com/dotnet/announcing-dotnet-chiseled-containers/)
- [.NET container images - Microsoft Learn](https://learn.microsoft.com/en-us/dotnet/core/docker/container-images)
- [dotnet-docker runtime-deps README](https://github.com/dotnet/dotnet-docker/blob/main/README.runtime-deps.md)

---

**Created:** 2026-01-29
