from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from database import products_collection, activity_collection
from sentence_transformers import SentenceTransformer
from scipy.spatial.distance import cosine
from pydantic import BaseModel
from auth import router as auth_router
from recommendation import get_recommendations
from numpy import isnan
from bson import ObjectId
from comparison import compare_products
import asyncio 

app = FastAPI(title="AI Shopping Assistant", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"],  
)

app.include_router(auth_router, prefix="/auth")

model = SentenceTransformer('all-MiniLM-L6-v2')

class SearchQuery(BaseModel):
    query: str

@app.post("/search/")
async def search_products(search_query: SearchQuery):
    query = search_query.query
    query_embedding = model.encode([query])[0]

    products = products_collection.find()
    product_scores = []

    for product in products:
        if "embedding" not in product or not isinstance(product["embedding"], list):
            continue  # Skip products without embeddings

        product_embedding = product["embedding"]
        similarity_score = 1 - cosine(query_embedding, product_embedding)

        # If similarity score is NaN, skip this product
        if isnan(similarity_score):
            continue  

        product_scores.append({
            'similarity_score': similarity_score,
            'title': product['title'],
            'brand': product['brand'],
            'description': product['description'],
            'final_price': product['final_price'],
            'currency': product['currency'],
            'rating': product.get('rating', "N/A"),
            'review': product.get('top_review', "No reviews"),
            'availability': product.get('availability', "Unknown"),
            '_id':str(product['_id']),
            'image_url': (
                product['image_url'] if isinstance(product.get('image_url'), str) and product['image_url'].lower() != "nan"
                else "https://default-image-url.com"
            )
        })

    product_scores.sort(key=lambda x: x['similarity_score'], reverse=True)

    return product_scores[:20]

class ActivityRequest(BaseModel):
    username: str
    product_id: str  # Received as a string from frontend

@app.post("/track-activity/")
async def track_activity(activity: ActivityRequest):
    """Store user activity when they view a product."""

    # Convert `product_id` from string to ObjectId
    try:
        product_id = ObjectId(activity.product_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid product ID format. Must be a valid ObjectId.")

    # Check if the product exists in MongoDB
    if not products_collection.find_one({"_id": product_id}):
        raise HTTPException(status_code=404, detail="Product not found.")

    # Debugging logs
    print(f"Tracking activity for user: {activity.username}, Product ID: {product_id}")

    # Store `product_id` as a STRING to avoid ObjectId issues in activity collection
    result = activity_collection.update_one(
        {"username": activity.username},
        {"$addToSet": {"viewed_products": str(activity.product_id)}},  # Store as string
        upsert=True
    )

    return {"message": "Activity recorded successfully."}

@app.get("/recommendations/{username}")
async def recommendations(username: str):
    return get_recommendations(username)


class ComparisonRequest(BaseModel):
    products: list

@app.post("/compare-products/")
async def compare_products_endpoint(request: ComparisonRequest):
    if len(request.products) < 2:
        raise HTTPException(status_code=400, detail="Please provide at least two products for comparison.")
    
    comparison_result = await compare_products(request)  # Ensure `compare_products` is awaited properly
    
    return JSONResponse(content=comparison_result)

@app.get("/")
async def root():
    return {"message": "Welcome to the AI Shopping Assistant API"}
