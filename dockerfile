# Use the official Node.js image as the base image
FROM node:18

# Create and change to the app directory
WORKDIR /app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Install nodemon globally
RUN npm install -g nodemon

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["nodemon", "index.js"]
