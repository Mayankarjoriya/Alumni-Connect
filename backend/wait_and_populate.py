import sqlite3
import time
import json

conn = sqlite3.connect('alumni_connect.db')
cursor = conn.cursor()

print("Waiting for a valid JSON public key to be uploaded...")
for i in range(30):
    cursor.execute("SELECT public_key FROM users WHERE public_key IS NOT NULL AND public_key LIKE '{%' LIMIT 1")
    row = cursor.fetchone()
    if row and row[0]:
        valid_key = row[0]
        try:
            # Validate JSON
            json.loads(valid_key)
            cursor.execute("UPDATE users SET public_key = ? WHERE public_key IS NULL", (valid_key,))
            conn.commit()
            print(f"Success! Populated valid public key to {cursor.rowcount} users.")
            break
        except json.JSONDecodeError:
            pass
    time.sleep(2)
else:
    print("Timeout waiting for valid public key.")
conn.close()
