FROM node:24-alpine

# Install pnpm globally
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if present)
COPY package*.json ./

# Copy the rest of the application
COPY . .

# Install dependencies
RUN pnpm install

# Expose port
EXPOSE 3000

# Start the application
CMD ["pnpm", "dev"]