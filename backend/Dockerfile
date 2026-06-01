# syntax=docker/dockerfile:1

# ---- Build stage ----
# Maven + JDK 21 image builds the Spring Boot fat JAR.
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /build

# Resolve dependencies first so this layer is cached unless pom.xml changes.
COPY pom.xml .
RUN mvn -B dependency:go-offline

# Compile and package. Tests run in CI, not in the image build.
COPY src ./src
RUN mvn -B clean package -DskipTests

# ---- Runtime stage ----
# Slim JRE-only image for a small, fast-starting runtime container.
FROM eclipse-temurin:21-jre-alpine AS runtime
WORKDIR /app

# artifactId=telemetry, version=0.0.1-SNAPSHOT -> telemetry-0.0.1-SNAPSHOT.jar
COPY --from=build /build/target/telemetry-*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
