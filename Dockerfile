# syntax=docker/dockerfile:1
FROM node:16.13.2
ENV NODE_ENV=production
WORKDIR /app
COPY ["package.json", "package-lock.json*", "./"]
RUN npm install
COPY . .
CMD [ "node", "server" ]
