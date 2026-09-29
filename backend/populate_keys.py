import sqlite3

try:
    conn = sqlite3.connect('alumni_connect.db')
    cursor = conn.cursor()
    
    # Get a valid public key from any user who has one
    cursor.execute("SELECT public_key FROM users WHERE public_key IS NOT NULL LIMIT 1")
    row = cursor.fetchone()
    
    if row and row[0]:
        valid_key = row[0]
        # Update all other users to have this valid key just for testing purposes
        cursor.execute("UPDATE users SET public_key = ? WHERE public_key IS NULL", (valid_key,))
        conn.commit()
        print(f"Updated users with dummy valid public key: {cursor.rowcount} rows affected.")
    else:
        print("No valid public key found in the database yet.")
    
    conn.close()
except Exception as e:
    print("Error:", e)
