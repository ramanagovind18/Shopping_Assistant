from fastapi import APIRouter, FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import json
import os
import requests

# Import FastAPI app
router = APIRouter()  # Assuming you're adding this to main.py

# Set your OpenRouter API key
api_key = os.getenv("OPENROUTER_API_KEY", "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")

# OpenRouter API URL
api_url = "https://openrouter.ai/api/v1/chat/completions"

# Headers
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json",
    "HTTP-Referer": "yourwebsite.com",  # Replace with your own domain or leave blank
    "X-Title": "Product Comparison App"
}

class Product(BaseModel):
    title: str
    brand: str
    final_price: float
    currency: str
    rating: float
    availability: str
    description: str
    review: str = "No review available"

class ComparisonRequest(BaseModel):
    products: List[Product]

@router.post("/compare-products/")
async def compare_products(comparison_request: ComparisonRequest):
    print(comparison_request, type(comparison_request))
    products = comparison_request.products  # No need to call .dict()

    if len(products) < 2:
        raise HTTPException(status_code=400, detail="Please provide at least two products for comparison.")
    
    # Constructing the prompt
    prompt = "Compare the following products and provide a structured analysis:\n\n"
    for product in products:
        prompt += (
            f"**Title:** {product['title']}\n"
            f"**Brand:** {product['brand']}\n"
            f"**Price:** {product['final_price']} {product['currency']}\n"
            f"**Rating:** {product['rating']} stars\n"
            f"**Availability:** {product['availability']}\n"
            f"**Description:** {product['description']}\n"
            f"**Review:** {product.get('review', 'No review available')}\n\n"
        )
    
    prompt += "Provide a detailed yet concise comparison focusing on price, quality, user feedback, and key features."

    # Request payload
    payload = {
        "model": "deepseek/deepseek-chat-v3-0324:free",  # Using the free-tier model
        "messages": [
            {"role": "system", "content": "You are an AI that specializes in product comparisons."},
            {"role": "user", "content": prompt}
        ]
    }

    # Make API request
    response = requests.post(api_url, headers=headers, json=payload)

    # Handle response
    if response.status_code == 200:
        result = response.json()
        return {"comparison_result": result["choices"][0]["message"]["content"]}
    else:
        raise HTTPException(status_code=response.status_code, detail=response.text)
