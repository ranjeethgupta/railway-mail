FROM node:20

WORKDIR /app

# Copy backend package files and install dependencies
COPY backend/package.json backend/package-lock.json* ./
RUN npm install

# Copy backend source code
COPY backend/. ./

# Build frontend (if needed)
RUN npm run build || true

EXPOSE 3010

CMD ["npm", "run", "start"]