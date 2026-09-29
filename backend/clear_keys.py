import sqlite3

conn = sqlite3.connect('alumni_connect.db')
cursor = conn.cursor()
cursor.execute("UPDATE users SET public_key = NULL")
conn.commit()
print("All public keys cleared.")
conn.close()
