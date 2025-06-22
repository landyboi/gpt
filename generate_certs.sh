#!/bin/bash

# Create the certs directory if it doesn't exist
mkdir -p nginx/certs

# Generate a self-signed certificate for localhost, valid for 1 year
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/certs/selfsigned.key \
  -out nginx/certs/selfsigned.crt \
  -subj "/CN=localhost"

echo "Self-signed certificate generated at nginx/certs/"
