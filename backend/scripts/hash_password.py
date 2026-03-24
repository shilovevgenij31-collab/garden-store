#!/usr/bin/env python3
"""Generate a bcrypt hash for the admin password.

Usage:
    python scripts/hash_password.py

Then paste the output into your .env file as ADMIN_PASSWORD_HASH.
"""
import getpass
import bcrypt


def main():
    password = getpass.getpass("Enter admin password: ")
    if not password:
        print("Error: password cannot be empty")
        return

    confirm = getpass.getpass("Confirm password: ")
    if password != confirm:
        print("Error: passwords do not match")
        return

    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode()
    print(f"\nAdd this to your .env file:\n")
    print(f"ADMIN_PASSWORD_HASH={hashed}")
    print(f"\nThen remove or clear ADMIN_PASSWORD.")


if __name__ == "__main__":
    main()
