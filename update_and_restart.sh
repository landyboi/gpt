#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Pulling latest changes from git..."
git pull

echo "Rebuilding and restarting Docker containers..."
docker-compose down
# Remove old images (optional, uncomment if you want a clean rebuild)
# docker-compose down --rmi all -v

docker-compose up --build -d

echo "Done. Containers are up to date." 