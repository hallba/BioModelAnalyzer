# Stage 1: Build frontend (vendor deps + TypeScript + Grunt bundle)
FROM node:20-slim AS frontend
RUN apt-get update && apt-get install -y --no-install-recommends curl unzip ca-certificates \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /src
COPY scripts/prepare-frontend-deps.sh scripts/
COPY paket.dependencies .
COPY src/bma.package/ src/bma.package/
COPY src/bma.client/ src/bma.client/
RUN ./scripts/prepare-frontend-deps.sh
WORKDIR /src/src/bma.package
RUN npm install --legacy-peer-deps
RUN npx tsc || true
# Case-sensitivity symlinks for Linux (TypeScript emits PascalCase)
RUN ln -sf Commands.js script/commands.js && \
    ln -sf Operation.js script/model/operation.js && \
    ln -sf LTLStatesViewer.js script/widgets/ltl/ltlstatesviewer.js && \
    ln -sf coloredTableViewer.js script/widgets/coloredtableviewer.js
RUN npx grunt prebuild
RUN npx grunt

# Stage 2: Build .NET API
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
# Copy built frontend into wwwroot (excluding ASP.NET project files)
COPY --from=frontend /src/src/bma.client/ src/BmaLinuxApi/wwwroot/
RUN rm -f src/BmaLinuxApi/wwwroot/bma.client.csproj \
         src/BmaLinuxApi/wwwroot/Global.asax \
         src/BmaLinuxApi/wwwroot/Global.asax.cs \
         src/BmaLinuxApi/wwwroot/paket.references \
         src/BmaLinuxApi/wwwroot/web.config \
         src/BmaLinuxApi/wwwroot/web.Debug.config \
         src/BmaLinuxApi/wwwroot/web.Release.config \
         src/BmaLinuxApi/wwwroot/run_iisexpress.cmd \
         src/BmaLinuxApi/wwwroot/test.txt && \
    rm -rf src/BmaLinuxApi/wwwroot/App_Start \
           src/BmaLinuxApi/wwwroot/Properties \
           src/BmaLinuxApi/wwwroot/installer
RUN dotnet restore "src/BmaLinuxApi/BmaLinuxApi.csproj"
RUN dotnet publish "src/BmaLinuxApi/BmaLinuxApi.csproj" \
    -c Release -r linux-x64 -o /app/publish

# Stage 3: Runtime
FROM mcr.microsoft.com/dotnet/runtime-deps:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8020
ENV ASPNETCORE_URLS=http://+:8020
ENTRYPOINT ["./BmaLinuxApi"]
