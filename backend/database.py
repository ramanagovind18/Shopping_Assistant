from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["shoppingdb"]
products_collection = db["products"]
users_collection = db["users"]
activity_collection = db["user_activity"]
