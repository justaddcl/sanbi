# Sanbi set planner app

This project is a Next.js web app (bootstrapped by the [T3 Stack](https://create.t3.gg)) with a TRPC back-end serving from a postgres database. We use `pnpm` as our package manager.

## Getting Started

### Prerequisites

- You will need Docker to run the postgres container for the database
- You will also need the secrets for the `.env` and `.env.local` to set the variables for postgres, Clerk, and Sentry
- If you have postgres already installed locally, it may conflict with the postgres Docker container. If you are seeing postgres errors while going through the steps below, you may need to remove your local installation of postgres to work with Sanbi. Local development with a postgres instance that is not run on a Docker container is not yet supported.

### Set up

1. Run `pnpm i` to install the project dependencies
2. Create `.env` and add the following variables: (you will need to get the correct values for each)
   DATABASE_URL
   POSTGRES_DATABASE
   POSTGRES_HOST
   POSTGRES_PASSWORD
   POSTGRES_PRISMA_URL
   POSTGRES_URL
   POSTGRES_URL_NON_POOLING
   POSTGRES_URL_NO_SSL
   POSTGRES_USER

   NEXT_PUBLIC_CLERK_SIGN_UP_URL
   NEXT_PUBLIC_CLERK_SIGN_IN_URL
   NEXT_PUBLIC_CLERK_SIGN_UP_FORCE_REDIRECT_URL
   NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL

   SENTRY_AUTH_TOKEN

3. Create `.env.local` and add the following variables: (you will need to get the correct values for each)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   CLERK_SECRET_KEY
4. Start the postgres database in the docker container by running the `./start-database.sh` script
5. Push the schema to the database by running `pnpm db:push` and then seed the data with test data with `pnpm db:seed`
6. Start the dev Next.js server by running `pnpm dev`
