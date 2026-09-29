import sqlite3

conn = sqlite3.connect('alumni_connect.db')
cursor = conn.cursor()
cursor.execute("SELECT id, name, public_key FROM users")
rows = cursor.fetchall()
for row in rows:
    pk = row[2]
    pk_display = pk[:20] + "..." if pk else "None"
    print(f"User {row[0]} ({row[1]}): {pk_display}")
conn.close()
