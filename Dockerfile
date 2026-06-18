# Estágio 1: Build da aplicação Node
FROM node:20-alpine AS build
WORKDIR /app

# Copia os arquivos de dependência
COPY package*.json ./

# Instala as dependências do projeto
RUN npm install

# Copia o restante do código da aplicação
COPY . .

# Realiza o build do projeto com Vite (gera os arquivos na pasta /app/dist)
RUN npm run build

# Estágio 2: Servidor Web (Nginx) para disponibilizar o site
FROM nginx:alpine

# Limpa o diretório padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos estáticos gerados no estágio de build para o Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configura o Nginx para lidar com rotas de Single Page Application (SPA)
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expõe a porta 80 do container
EXPOSE 80

# Inicia o servidor Nginx
CMD ["nginx", "-g", "daemon off;"]
