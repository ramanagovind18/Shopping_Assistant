import math
import numpy as np
from fastapi.responses import JSONResponse
from pymongo import MongoClient
from bson import ObjectId

# MongoDB connection
client = MongoClient("mongodb://localhost:27017/")
db = client["shoppingdb"]
user_activity_collection = db["user_activity"]
products_collection = db["products"]

def get_user_viewed_products(username):
    """Fetch user viewed products and convert IDs to ObjectId."""
    user_data = user_activity_collection.find_one({"username": username})
    if not user_data or "viewed_products" not in user_data:
        return []

    try:
        return [ObjectId(pid) for pid in user_data["viewed_products"]]
    except Exception as e:
        print(f"Error converting IDs: {e}")
        return []

def get_product_embeddings(product_ids):
    """Fetch product embeddings and titles."""
    products = products_collection.find({"_id": {"$in": product_ids}}, {"_id": 1, "embedding": 1, "title": 1})
    product_data = {}

    for product in products:
        embedding = product.get("embedding", [])
        if not embedding or any(math.isnan(x) for x in embedding):  
            continue  # Skip invalid embeddings

        product_data[str(product["_id"])] = {
            "embedding": np.array(embedding, dtype=np.float32),
            "title": product["title"]
        }

    return product_data

def get_recommendations(username, top_n=5):
    """Recommend products based on viewed product embeddings."""
    viewed_product_ids = get_user_viewed_products(username)
    if not viewed_product_ids:
        return {"message": "No viewed products found."}

    viewed_products = get_product_embeddings(viewed_product_ids)
    if not viewed_products:
        return {"message": "No valid embeddings found for viewed products."}

    # Compute average embedding
    all_embeddings = np.array([v["embedding"] for v in viewed_products.values()])
    avg_embedding = np.mean(all_embeddings, axis=0)

    if np.isnan(avg_embedding).any():  
        return {"message": "Average embedding contains NaN values."}

    # Find all products (excluding already viewed ones)
    all_products = products_collection.find(
        {"_id": {"$nin": viewed_product_ids}},
        {"_id": 1, "embedding": 1, "title": 1, "brand": 1, "final_price": 1, "currency": 1, "rating": 1, "image_url": 1}
    )

    scores = []
    for product in all_products:
        product_embedding = product.get("embedding", [])
        if not product_embedding or any(math.isnan(x) for x in product_embedding):
            continue  # Skip invalid embeddings

        product_embedding = np.array(product_embedding, dtype=np.float32)

        if product_embedding.shape != avg_embedding.shape:
            continue  # Skip if embedding shapes mismatch

        # Compute cosine similarity
        norm_avg = np.linalg.norm(avg_embedding)
        norm_product = np.linalg.norm(product_embedding)
        if norm_avg == 0 or norm_product == 0:
            continue  # Avoid division by zero

        similarity = np.dot(avg_embedding, product_embedding) / (norm_avg * norm_product)
        scores.append((similarity, product))

    # Sort by similarity score and get top N
    scores.sort(reverse=True, key=lambda x: x[0])
    
    # Prepare recommendations
    recommendations = []
    for similarity, product in scores[:top_n]:
        # Handle NaN in image_url
        image_url = product.get("image_url")
        if image_url is None or (isinstance(image_url, float) and math.isnan(image_url)):
            image_url = None
        
        recommendations.append({
            "id": str(product["_id"]),
            "title": product["title"],
            "brand": product["brand"],
            "price": product["final_price"],
            "currency": product["currency"],
            "rating": product["rating"],
            "image_url": image_url,
            "score": float(similarity) if not math.isnan(similarity) else 0.0
        })

    return {"recommended_products": recommendations}