#!/bin/bash
cd /home/azureuser/Milkman_Project/backend
source venv/bin/activate
gunicorn --workers 3 --bind unix:/home/azureuser/Milkman_Project/backend/milkman.sock milkman_backend.wsgi:application
