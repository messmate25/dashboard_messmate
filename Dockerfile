# Stage 1: Build React App
FROM node:22-alpine AS builder

WORKDIR /
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve with NGINX
FROM nginx:1.27-alpine

# Copy build output to nginx html folder
COPY --from=builder /build /usr/share/nginx/html

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
