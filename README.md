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

To create a user with the role of `admin`, you need to run seed script.

## Database Migration and Seed

💥 Make sure you have populated `.env.migrations` file with the necessary environment variables. You can use the `.env.migrations.example` file as a template.

```bash
# Copy the .env.migrations.example file to .env.migrations
cp .env.migrations.example .env.migrations
```

💥 For running the migrations and seed scripts, you need to have a MongoDB instance running. You can use the following command to run a MongoDB instance using Docker Compose.

```bash
# Before starting the migration:
npm run docker:start:migrations
```

```bash
# Create a new migration
npm run typeorm:migration:create <migration-name>

# Generate a new migration based on changes in entities
npm run typeorm:migration:generate <migration-name>

# Run migrations
npm run typeorm:migration:run

# Rollback migrations
npm run typeorm:migration:revert

# Show all migrations
npm run typeorm:migration:show

# Drop everything in DB
npm run typeorm:schema:drop

# Typeorm CLI with ts-node
npm run typeorm:cli
```

```bash
# Run all seed scripts in ./seeds directory
npm run typeorm:seed

# Run a specific seed script by name
npm run typeorm:seed -- --name ./seeds/create-admin.seed.ts

```

```bash
# After running the migration:
npm run docker:stop:migrations
```

## Environment Variables

💥 Make sure you have populated the `.env` file with the necessary environment variables. You can use the `.env.example` file as a template.

```bash
# Copy the .env.example file to .env
cp .env.example .env
```

## Running the

💥 Make sure to run the migrations if you are running the project for the first time. You will have to re-run the migrations whenever there are changes to entities.

```bash
# start development server
npm run docker:start:dev

# stop development server
npm run docker:stop:dev

# see logs
docker logs <container-name> -f
```
