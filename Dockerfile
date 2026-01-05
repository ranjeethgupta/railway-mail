# Use official Node.js LTS image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the application code
COPY . .

# Build frontend (if needed)
RUN npm run build || true

# Expose the port your app runs on
EXPOSE 3010

# Start the server
CMD ["npm", "run", "start"]
