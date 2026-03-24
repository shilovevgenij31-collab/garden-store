"""Database backup script.

SQLite: copies garden.db to backups/ directory.
PostgreSQL (future): uses pg_dump.

Usage: python -m scripts.backup
Keeps last 7 backups, rotates older ones.
"""
import shutil
import sys
from datetime import datetime
from pathlib import Path


BACKEND_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BACKEND_DIR / "garden.db"
BACKUP_DIR = BACKEND_DIR / "backups"
MAX_BACKUPS = 7


def backup():
    if not DB_PATH.exists():
        print(f"Database not found: {DB_PATH}")
        sys.exit(1)

    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M")
    backup_path = BACKUP_DIR / f"garden_{timestamp}.db"

    shutil.copy2(DB_PATH, backup_path)
    print(f"Backup created: {backup_path}")

    # Rotate: keep only last MAX_BACKUPS
    backups = sorted(BACKUP_DIR.glob("garden_*.db"), key=lambda p: p.stat().st_mtime)
    while len(backups) > MAX_BACKUPS:
        old = backups.pop(0)
        old.unlink()
        print(f"Rotated old backup: {old.name}")


if __name__ == "__main__":
    backup()
