# Use Eclipse Temurin for a lightweight Java runtime
FROM eclipse-temurin:21-jre-alpine

# Set working directory
WORKDIR /app

# Copy the built jar file from the target directory
# Note: You should run './mvnw clean package -DskipTests' before building the image
COPY target/*.jar app.jar

# Expose the application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
