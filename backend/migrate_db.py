import sqlite3

try:
    conn = sqlite3.connect('alumni_connect.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN public_key TEXT")
        print("Added public_key to users")
    except sqlite3.OperationalError as e:
        print("users table already has public_key or error:", e)

    try:
        cursor.execute("ALTER TABLE messages ADD COLUMN iv TEXT")
        print("Added iv to messages")
    except sqlite3.OperationalError as e:
        print("messages table already has iv or error:", e)

    try:
        cursor.execute("ALTER TABLE messages ADD COLUMN is_encrypted BOOLEAN DEFAULT 0")
        print("Added is_encrypted to messages")
    except sqlite3.OperationalError as e:
        print("messages table already has is_encrypted or error:", e)

    conn.commit()
    conn.close()
    print("Database migration complete.")
except Exception as e:
    print("Failed:", e)
