# Use official Node.js LTS image
FROM node:20-alpine

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Build TypeScript
RUN npm run build

# Expose API port
EXPOSE 3000

# Run the app
CMD ["node", "dist/main.js"]

