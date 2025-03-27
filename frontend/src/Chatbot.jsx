import React, { useState, useEffect } from 'react';
import Product from './Product';
import ProductModal from './ProductModal';
import ComparisonSidebar from './ComparisonSidebar';

const Chatbot = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [username, setUsername] = useState("");
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (query.trim() === "") return;
    
    setLoading(true);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/search/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setResults(data);
        // Clear previous selections when new search is performed
        setSelectedProducts([]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductClick = async (product) => {
    setSelectedProduct(product);
    
    if (!username) {
      console.error('User not logged in');
      return;
    }

    try {
      await fetch('http://127.0.0.1:8000/track-activity/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username,
          product_id: product._id,
        }),
      });
    } catch (error) {
      console.error('Error storing viewed product:', error);
    }
  };

  const handleSelectProduct = (productId, isSelected) => {
    setSelectedProducts(prev => {
      const product = results.find(p => p._id === productId);
      if (!product) return prev;
      
      return isSelected 
        ? [...prev, product]
        : prev.filter(p => p._id !== productId);
    });
  };

  const handleCompare = async () => {
    if (selectedProducts.length < 2) return;
    
    setIsComparing(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/compare-products/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ products: selectedProducts }),
      });
      
      if (response.ok) {
        const data = await response.json();
        setComparisonResult(data.comparison_result);
      }
    } catch (error) {
      console.error('Error comparing products:', error);
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "auto", fontFamily: "Arial, sans-serif" }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "20px"
      }}>
        <h2 style={{ fontSize: "24px", fontWeight: "700", color: "#131921", margin: 0 }}>
          AI Shopping Assistant
          {username && <p style={{ fontSize: "16px", fontWeight: "400", margin: "5px 0 0 0" }}>Welcome, {username}!</p>}
        </h2>
        
        <button
          onClick={() => setShowComparison(true)}
          disabled={selectedProducts.length < 2}
          style={{
            padding: "10px 15px",
            backgroundColor: selectedProducts.length >= 2 ? "#FF9900" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: selectedProducts.length >= 2 ? "pointer" : "not-allowed",
            height: "fit-content"
          }}
        >
          Compare ({selectedProducts.length})
        </button>
      </div>
      
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for products..."
          style={{
            width: "100%",
            padding: "12px 15px",
            fontSize: "16px",
            border: "1px solid #d5d5d5",
            borderRadius: "5px",
            marginBottom: "12px",
            outline: "none"
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: "#FF9900",
            color: "#fff",
            fontSize: "16px",
            padding: "12px 0",
            width: "100%",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer"
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "20px" }}>
        {results.length > 0 ? (
          results.map((product, index) => (
            <Product 
              key={index} 
              product={product} 
              onClick={handleProductClick}
              isSelected={selectedProducts.some(p => p._id === product._id)}
              onSelect={handleSelectProduct}
              draggable={true}
            />
          ))
        ) : (
          <p style={{ fontSize: "16px", color: "#555" }}>No results found.</p>
        )}
      </div>

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
        />
      )}

      {showComparison && (
        <ComparisonSidebar
          selectedProducts={selectedProducts}
          onCompare={handleCompare}
          onClose={() => {
            setShowComparison(false);
            setComparisonResult(null);
          }}
          comparisonResult={comparisonResult}
          isLoading={isComparing}
        />
      )}
    </div>
  );
};

export default Chatbot;