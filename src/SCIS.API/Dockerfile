FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000
EXPOSE 5001

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["src/SCIS.API/SCIS.API.csproj", "src/SCIS.API/"]
COPY ["src/SCIS.Core/SCIS.Core.csproj", "src/SCIS.Core/"]
COPY ["src/SCIS.Infrastructure/SCIS.Infrastructure.csproj", "src/SCIS.Infrastructure/"]
COPY ["src/SCIS.ML/SCIS.ML.csproj", "src/SCIS.ML/"]
RUN dotnet restore "src/SCIS.API/SCIS.API.csproj"
COPY . .
WORKDIR "/src/src/SCIS.API"
RUN dotnet build "SCIS.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SCIS.API.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SCIS.API.dll"]
