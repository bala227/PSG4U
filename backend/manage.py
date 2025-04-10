#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys
import django
from django.db import connection

def check_database_connection():
    """Check if the database is connected."""
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")  # A simple test query
        print("✅ Database connected successfully!")
    except Exception as e:
        print(f"❌ Database connection failed: {e}")

def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project.settings')

    try:
        from django.core.management import execute_from_command_line
        django.setup()  # Initialize Django
        check_database_connection()  # Check DB connection
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    
    execute_from_command_line(sys.argv)

if __name__ == '__main__':
    main()
