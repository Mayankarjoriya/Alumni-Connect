import requests

headers = {
    "Authorization": "Bearer token_u3",
    "Content-Type": "application/json"
}
data = {
    "receiver_id": "u2",
    "content": "test content",
    "iv": "test iv",
    "is_encrypted": True
}
try:
    response = requests.post("http://localhost:8000/api/messages", json=data, headers=headers)
    print("Status:", response.status_code)
    print("Body:", response.text)
except Exception as e:
    print("Error:", e)
