# Blog App Backend in Nest.js, GraphQL and MongoDB with TypeORM

This is a blog app backend built with Nest.js, GraphQL and MongoDB with TypeORM.

## Prerequisites

You must have the following installed on your machine:

- Node.js (v20.12.2)
- npm (v10.7.0)
- Docker Desktop (including Docker Compose)

## Installation

```bash
npm install
```

## Admin User Creation

To create a user with the role of `admin`, you need to run database migration.

## Database Migration

Make sure you have populated `.env.migrations` file with the necessary environment variables. You can use the `.env.example.migrations` file as a template.

```bash
# Copy the .env.example.migrations file to .env.migrations
cp .env.example.migrations .env.migrations
```

For running the database migration, you need to have a MongoDB instance running. You can use the following command to run a MongoDB instance using Docker Compose.

```bash
# Before starting the migration:
npm run docker:start:migrations
```

```bash
# Run migrations
npx migrate-mongo up

# Rollback migrations
npx migrate-mongo down

# Create a new migration
npx migrate-mongo create <migration-name>

# Check the status of migrations
npx migrate-mongo status
```

```bash
# After running the migration:
npm run docker:stop:migrations
```

## Running the app

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```
