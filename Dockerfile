# Use official Node.js image as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy rest of the application
COPY . .

# Expose port
EXPOSE 3001

# Start the app
CMD ["node", "server.js"]
