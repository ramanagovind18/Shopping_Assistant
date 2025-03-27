import numpy as np
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient

# Initialize the sentence-transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['shoppingdb']  # Your DB name
products_collection = db['products']  # Your collection name

# Fetch products from the database
products = products_collection.find()

# Loop through products to generate and update embeddings
for product in products:
    product_description = product.get('description', '')

    if not product_description or not isinstance(product_description, str):
        print(f"Skipping product {products._id} due to missing/invalid description")
        continue  # Skip products with invalid descriptions

    # Generate embedding and convert to list
    product_embedding = model.encode(product_description)
    
    # Ensure no NaN values in embedding
    if np.isnan(product_embedding).any():
        print(f"NaN detected in embedding for product {products._id}, replacing with zeros.")
        product_embedding = np.nan_to_num(product_embedding).tolist()
    else:
        product_embedding = product_embedding.tolist()

    # Update the product with the new embedding
    products_collection.update_one(
        {'_id': product['_id']},  # Find the document by _id
        {'$set': {'embedding': product_embedding}}  # Set the embedding field
    )

print("Embeddings updated for all products without NaN values.")
