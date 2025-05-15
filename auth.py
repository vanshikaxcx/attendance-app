import json

def load_users():
    with open("users.json", "r") as f:
        return json.load(f)

def authenticate(username, password):
    users = load_users()
    return users.get(username) == password