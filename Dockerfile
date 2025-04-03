#Use Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

#Copy the rest of the application files
COPY . .

#Install dependencies using Yarn
RUN yarn install --frozen-lockfile

#Build the TypeScript code
RUN yarn build

# Define the default command to start the app
CMD ["yarn", "start"]

