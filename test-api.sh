#!/bin/bash
echo "Testing /api/v1/auth/login..."
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'

echo -e "\n\nTesting /api/auth/login..."
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'

echo -e "\n\nDone!"
