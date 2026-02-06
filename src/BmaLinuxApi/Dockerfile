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
