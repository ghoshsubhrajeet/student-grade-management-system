# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Spring Boot backend and bundle the frontend
FROM maven:3.9-eclipse-temurin-17-alpine AS backend-build
WORKDIR /app
COPY pom.xml ./
COPY src ./src
# Copy the built React assets into Spring Boot's static folder
COPY --from=frontend-build /app/dist ./src/main/resources/static
RUN mvn clean package -DskipTests

# Stage 3: Run the packaged application
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=backend-build /app/target/*.jar app.jar
# Expose default port
EXPOSE 8081
# Run the application (Render will dynamically pass the PORT environment variable)
ENTRYPOINT ["java", "-jar", "app.jar"]
