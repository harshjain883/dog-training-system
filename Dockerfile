FROM node:18-alpine

WORKDIR /app

# Backend package files copy aur dependencies install
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --only=production

# Baaki backend code copy
COPY backend/ ./backend/

WORKDIR /app/backend

EXPOSE 8080

CMD ["npm", "start"]
