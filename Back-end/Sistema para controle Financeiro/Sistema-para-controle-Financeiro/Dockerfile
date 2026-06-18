# Estágio 1: Build
FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app

# Copia o arquivo pom.xml e faz o download das dependências (aproveita o cache do Docker)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copia o código-fonte e realiza a compilação gerando o pacote .jar
COPY src ./src
RUN mvn clean package -DskipTests

# Estágio 2: Run (Runtime mais leve apenas com o JRE)
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Copia o .jar gerado no estágio anterior (target/*.jar) para o ambiente de execução
COPY --from=build /app/target/*.jar app.jar

# Expõe a porta padrão que o Spring Boot utiliza
EXPOSE 8080

# Comando para iniciar a aplicação
ENTRYPOINT ["java", "-jar", "app.jar"]
