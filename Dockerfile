FROM node:18-alpine

WORKDIR /app

# Entire repository copy karein
COPY . .

# Backend directory me jaakar install karein
WORKDIR /app/backend
RUN npm install

EXPOSE 8080

CMD ["npm", "start"]

