# Stage 1: Build
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copy pom.xml and download dependencies (leverages Docker cache)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code and compile, producing the .jar package
COPY src ./src
RUN mvn clean package -DskipTests

# Stage 2: Run (lighter runtime with only the JRE)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copy the .jar built in the previous stage (target/*.jar) into the runtime
COPY --from=build /app/target/*.jar app.jar

# Expose the default port used by Spring Boot
EXPOSE 8080

# Command to start the application
ENTRYPOINT ["java", "-jar", "app.jar"]
