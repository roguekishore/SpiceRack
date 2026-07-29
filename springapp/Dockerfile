# ── Stage 1: Build native binary ─────────────────────────────────────────────
FROM --platform=linux/arm64 ghcr.io/graalvm/native-image-community:17 AS build

# Install Maven (GraalVM image only ships the JDK + native-image tool)
RUN microdnf install -y maven && microdnf clean all

WORKDIR /app

# Download dependencies first (cached layer — only re-runs if pom.xml changes)
COPY pom.xml .
RUN mvn dependency:go-offline -q

# Copy source and compile to native binary
COPY src ./src
RUN mvn clean package -Pnative -DskipTests

# ── Stage 2: Minimal runtime image ───────────────────────────────────────────
# No JRE needed — the native binary is self-contained
FROM --platform=linux/arm64 debian:bookworm-slim

WORKDIR /app

# Copy the compiled native binary from build stage
COPY --from=build /app/target/spicerack app

EXPOSE 8080

ENTRYPOINT ["./app"]
