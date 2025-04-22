#!/bin/bash

# Setup script for Spediak app

echo "Setting up Spediak application..."

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "Installing backend dependencies..."
cd backend
npm install
cd ..

# Copy environment file if it doesn't exist
if [ ! -f ./backend/.env ]; then
  echo "Creating .env file for backend..."
  cp ./backend/.env.example ./backend/.env
  echo "Please update the JWT_SECRET in ./backend/.env with a secure random string"
fi

echo "Setup complete! You can now run the app with:"
echo "npm run dev" 