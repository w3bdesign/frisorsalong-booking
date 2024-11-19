# Multi-stage Dockerfile for building and running both backend and frontend

# Stage 1: Build backend
FROM node:20 AS backend-builder
WORKDIR /app/backend
COPY backend/package.json backend/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY backend .
RUN pnpm build

# Stage 2: Build frontend
FROM node:20 AS frontend-builder
WORKDIR /app/frontend
COPY frontend/admin/package.json frontend/admin/pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY frontend/admin .
RUN pnpm build

# Stage 3: Run backend and frontend
FROM node:20
WORKDIR /app

# Copy backend build
COPY --from=backend-builder /app/backend/dist ./backend/dist
COPY --from=backend-builder /app/backend/node_modules ./backend/node_modules
COPY --from=backend-builder /app/backend/package.json ./backend/package.json

# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules
COPY --from=frontend-builder /app/frontend/package.json ./frontend/package.json

# Install serve to serve the frontend
RUN npm install -g serve

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Expose ports
EXPOSE 3000
EXPOSE 5173

# Start both backend and frontend
CMD ["sh", "-c", "node backend/dist/main.js & serve -s frontend/dist -l 5173"]
