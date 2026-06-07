#!/usr/bin/env bash
# Use this script to start a docker container for a local development database

# TO RUN ON WINDOWS:
# 1. Install WSL (Windows Subsystem for Linux) - https://learn.microsoft.com/en-us/windows/wsl/install
# 2. Install Docker Desktop for Windows - https://docs.docker.com/docker-for-windows/install/
# 3. Open WSL - `wsl`
# 4. Run this script - `./start-database.sh`

# On Linux and macOS you can run this script directly - `./start-database.sh`

DB_CONTAINER_NAME="sanbi-postgres"
POSTGRES_USER="postgres"
DEV_DATABASE_NAME="sanbi"
E2E_DATABASE_NAME="sanbi_e2e"

wait_for_postgres() {
  for _ in {1..30}; do
    if docker exec "$DB_CONTAINER_NAME" pg_isready -U "$POSTGRES_USER" >/dev/null 2>&1; then
      return 0
    fi

    sleep 1
  done

  echo "Timed out waiting for database container '$DB_CONTAINER_NAME' to accept connections"
  exit 1
}

ensure_database_exists() {
  local database_name=$1
  local database_exists

  database_exists=$(docker exec "$DB_CONTAINER_NAME" psql -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname = '$database_name'")

  if [ "$database_exists" = "1" ]; then
    echo "Database '$database_name' already exists"
    return 0
  fi

  docker exec "$DB_CONTAINER_NAME" createdb -U "$POSTGRES_USER" "$database_name"
  echo "Database '$database_name' was successfully created"
}

ensure_local_databases_exist() {
  wait_for_postgres
  ensure_database_exists "$DEV_DATABASE_NAME"
  ensure_database_exists "$E2E_DATABASE_NAME"
}

if ! [ -x "$(command -v docker)" ]; then
  echo -e "Docker is not installed. Please install docker and try again.\nDocker install guide: https://docs.docker.com/engine/install/"
  exit 1
fi

if [ "$(docker ps -q -f name=$DB_CONTAINER_NAME)" ]; then
  echo "Database container '$DB_CONTAINER_NAME' already running"
  ensure_local_databases_exist
  exit 0
fi

if [ "$(docker ps -q -a -f name=$DB_CONTAINER_NAME)" ]; then
  docker start "$DB_CONTAINER_NAME"
  echo "Existing database container '$DB_CONTAINER_NAME' started"
  ensure_local_databases_exist
  exit 0
fi

# import env variables from .env
set -a
source .env

DB_PASSWORD=$(echo "$DATABASE_URL" | awk -F':' '{print $3}' | awk -F'@' '{print $1}')
DB_PORT=$(echo "$DATABASE_URL" | awk -F':' '{print $4}' | awk -F'\/' '{print $1}')

if [ "$DB_PASSWORD" = "password" ]; then
  echo "You are using the default database password"
  read -p "Should we generate a random password for you? [y/N]: " -r REPLY
  if ! [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Please set a password in the .env file and try again"
    exit 1
  fi
  # Generate a random URL-safe password
  DB_PASSWORD=$(openssl rand -base64 12 | tr '+/' '-_')
  sed -i -e "s#:password@#:$DB_PASSWORD@#" .env
fi

if ! docker run -d \
  --name $DB_CONTAINER_NAME \
  -e POSTGRES_USER="$POSTGRES_USER" \
  -e POSTGRES_PASSWORD="$DB_PASSWORD" \
  -e POSTGRES_DB="$DEV_DATABASE_NAME" \
  -p "$DB_PORT":5432 \
  docker.io/postgres; then
  echo "Failed to create database container '$DB_CONTAINER_NAME'"
  exit 1
fi

echo "Database container '$DB_CONTAINER_NAME' was successfully created"

ensure_local_databases_exist
