# syntax=docker/dockerfile:1

# ---- Build stage ----
# Node 20 builds the Vite production bundle (tsc -b && vite build -> dist/).
FROM node:20-alpine AS build
WORKDIR /app

# Install deps first so this layer is cached unless the lockfile changes.
COPY package.json package-lock.json ./
RUN npm ci

# API base URL is baked at build time. Defaults to the local backend; override
# with --build-arg VITE_API_BASE_URL=https://<render-url> for a hosted deploy.
ARG VITE_API_BASE_URL=http://localhost:8080
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

COPY . .
RUN npm run build

# ---- Serve stage ----
# nginx serves the static bundle.
FROM nginx:alpine AS serve
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
