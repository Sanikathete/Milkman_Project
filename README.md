#Milkman Project

A small full-stack web application for managing milk and dairy subscriptions.

The idea behind this project is to build a platform where customers can browse dairy products, subscribe to daily deliveries, and manage their subscriptions online. The project is built using Django for the backend and React for the frontend.

This repository contains both the backend API and the frontend interface.

Features

User authentication (Login / Signup)

Separate roles for Admin and Customer

Browse dairy products by category

Product images and product listing

Subscription system for daily or weekly delivery

Customer dashboard to manage subscriptions

Admin management for products and categories

Tech Stack

Backend

Python

Django

Django REST Framework

SQLite (for development)

JWT Authentication

Frontend

React

JavaScript

Tailwind CSS

Project Structure
milkman/
│
├── backend/
│   ├── milkman/
│   ├── apps/
│   ├── manage.py
│
├── frontend/
│   ├── src/
│   ├── public/
│
└── README.md

backend/ contains the Django API and database models.

frontend/ contains the React application that consumes the API.

Main Modules
Users

Handles authentication and user roles.

Custom user model

JWT login system

Admin and Customer permissions

Products

Manages dairy products and categories.

Product list

Product images

Category based browsing

Subscriptions

Allows customers to subscribe to products.

Start date / end date

Daily or weekly delivery

Subscription management

Running the Project Locally
1. Clone the repository
git clone https://github.com/Sanikathete/Milkman_Project.git
cd Milkman_Project
2. Backend Setup

Go to the backend folder:

cd backend

Create a virtual environment:

python -m venv venv

Activate it:

Windows

venv\Scripts\activate

Mac/Linux

source venv/bin/activate

Install dependencies:

pip install -r requirements.txt

Run migrations:

python manage.py migrate

Start the backend server:

python manage.py runserver

Backend will run on:

http://127.0.0.1:8000
3. Frontend Setup

Open a new terminal and go to frontend:

cd frontend

Install dependencies:

npm install

Start the React app:

npm start

Frontend will run on:

http://localhost:3000
Future Improvements

Some things that could be added later:

Online payment integration

Delivery scheduling

Order tracking

Notifications for deliveries

Mobile responsive improvements

Deployment to cloud

Purpose of This Project

This project was built as a learning project for full-stack development using Django and React. It focuses on understanding API development, frontend integration, and building a subscription-based system.
