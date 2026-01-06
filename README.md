<h1 align="center">賛美 Sanbi Set Planner</h1>

![GitHub License](https://img.shields.io/github/license/justaddcl/sanbi?style=flat-square)
![CircleCI](https://img.shields.io/circleci/build/github/justaddcl/sanbi?style=flat-square)
![Issues](https://img.shields.io/github/issues/justaddcl/sanbi?style=flat-square)
![Contributor Covenant](https://img.shields.io/badge/code%20of%20conduct-contributor%20covenant-4baaaa.svg?style)

This project is a Next.js web app (bootstrapped by the [T3 Stack](https://create.t3.gg)) with a TRPC back-end serving from a postgres database. We use `pnpm` as our package manager.

## Getting Started

### Prerequisites

- You will need Docker to run the postgres container for the database
- You will also need the secrets for the `.env` and `.env.local` to set the variables for postgres, Clerk, and Sentry
- If you have postgres already installed locally, it may conflict with the postgres Docker container. If you are seeing postgres errors while going through the steps below, you may need to remove your local installation of postgres to work with Sanbi. Local development with a postgres instance that is not run on a Docker container is not yet supported.

### Set up

1. Run `pnpm i` to install the project dependencies
2. Copy `.env.example` to `.env` (create if you don't already have this file) and fill in the values for each.
3. Create `.env.local` and move the following variables from the `.env`: (again, you will need to get the correct values for each)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
   CLERK_SECRET_KEY
4. Start the postgres database in the docker container by running the `./start-database.sh` script
5. Push the schema to the database by running `pnpm db:push` and then seed the data with test data with `pnpm db:seed`
6. Start the dev Next.js server by running `pnpm dev`

## Copyright & License

Copyright © 2024 justaddcl

This project is licensed under the Apache License 2.0.

Commercial use, modification, and self-hosting are permitted under the terms of this license.
