# Use the official Node.js image as the base image
FROM node:20

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install application dependencies
RUN npm install

# Copy the rest of the project files
COPY . .

# Build the application
RUN npm run build

# Run Prisma generate to set up the database client
RUN npx prisma generate

# Expose the application port
EXPOSE 3000

# Command to run the application
CMD ["npm", "run", "start"]
