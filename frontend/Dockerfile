# Stage 1: Build the Angular application
FROM node:20-alpine as build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /app/dist/frontend/browser /usr/share/nginx/html
# Cloud Run expects 8080 by default
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
