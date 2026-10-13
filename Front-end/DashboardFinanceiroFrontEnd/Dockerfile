# Stage 1: Node application build
FROM node:20-alpine AS build
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the project with Vite (outputs files to /app/dist)
RUN npm run build

# Stage 2: Web server (Nginx) to serve the site
FROM nginx:alpine

# Clear the default Nginx directory
RUN rm -rf /usr/share/nginx/html/*

# Copy the static files generated in the build stage to Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Configure Nginx to handle Single Page Application (SPA) routes
RUN echo 'server { \
    listen 80; \
    server_name localhost; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

# Expose the container port 80
EXPOSE 80

# Start the Nginx server
CMD ["nginx", "-g", "daemon off;"]
