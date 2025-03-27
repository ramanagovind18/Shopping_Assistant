from scipy.spatial.distance import cosine
from sentence_transformers import SentenceTransformer
from pymongo import MongoClient

# Initialize the sentence-transformer model
model = SentenceTransformer('all-MiniLM-L6-v2')

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['shoppingdb']
products_collection = db['products']

# Example query
query = "stylish red jacket"

# Generate the query embedding
query_embedding = model.encode([query])[0]

# Fetch products from MongoDB
products = products_collection.find()

# List to store product similarity scores
product_scores = []

for product in products:
    # Ensure that the product has an embedding
    if 'embedding' in product:
        product_embedding = product['embedding']
        
        # Calculate the cosine similarity between the query embedding and the product embedding
        similarity_score = 1 - cosine(query_embedding, product_embedding)
        
        # Store the product and its similarity score
        product_scores.append((product, similarity_score))

# Sort products by similarity score in descending order
product_scores.sort(key=lambda x: x[1], reverse=True)

# Return top 5 most similar products
top_products = product_scores[:5]

# Print the top products with their similarity scores and extra details
for product, score in top_products:
    print(f"Product: {product['title']}")
    print(f"Description: {product['description']}")
    print(f"Price: {product['final_price']} {product['currency']}")
    print(f"Similarity: {score:.4f}")
    print("-" * 50)
