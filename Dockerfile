# Development Setup
FROM node:20-alpine3.19 AS development_setup

WORKDIR /app

COPY ./package*.json ./

# Development
FROM node:20-alpine3.19 AS development

WORKDIR /app

COPY ./package*.json ./

RUN npm install

COPY . .

EXPOSE 5001

CMD ["npm", "run", "start:dev"]

# Production
FROM node:20-alpine3.19 AS production

USER node

WORKDIR /app

COPY --chown=node:node ./package*.json ./

RUN npm ci

COPY --chown=node:node . .

EXPOSE 5001

CMD ["node", "dist/src/main.js"]
