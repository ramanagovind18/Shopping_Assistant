import React, { useState, useEffect } from 'react';
import Product from './Product';
import ComparisonSidebar from './ComparisonSidebar';
import ProductModal from './ProductModal';

const Recommendations = () => {
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [error, setError] = useState(null);
  const [isFetchingRecs, setIsFetchingRecs] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsFetchingRecs(true);
        setError(null);
        const username = localStorage.getItem('username');
        const token = localStorage.getItem('token');
        
        if (!username) {
          throw new Error('User not logged in');
        }

        const response = await fetch(`http://localhost:8000/recommendations/${username}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Handle different response formats
        if (data.recommended_products) {
          setProducts(data.recommended_products.map(p => ({
            ...p,
            id: p._id || p.id // Ensure consistent ID field
          })));
        } else if (Array.isArray(data)) {
          setProducts(data.map(p => ({
            ...p,
            id: p._id || p.id
          })));
        } else {
          throw new Error('Unexpected response format');
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setError(error.message);
      } finally {
        setIsFetchingRecs(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleSelectProduct = (productId, isSelected) => {
    setSelectedProducts(prev => {
      const product = products.find(p => (p._id || p.id) === productId);
      if (!product) return prev;
      
      return isSelected 
        ? [...prev, product]
        : prev.filter(p => (p._id || p.id) !== productId);
    });
  };

  const handleCompare = async (productsToCompare) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch("http://localhost:8000/compare-products/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ products: productsToCompare })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setComparisonResult(data.comparison_result || data);
    } catch (error) {
      console.error("Comparison failed:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshRecommendations = async () => {
    setIsFetchingRecs(true);
    setError(null);
    try {
      const username = localStorage.getItem('username');
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/recommendations/${username}?refresh=true`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setProducts(data.recommended_products || data);
    } catch (error) {
      console.error("Error refreshing recommendations:", error);
      setError(error.message);
    } finally {
      setIsFetchingRecs(false);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        marginBottom: "20px",
        alignItems: "center"
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h2 style={{ margin: 0 }}>Recommended Products</h2>
          <button 
            onClick={refreshRecommendations}
            disabled={isFetchingRecs}
            style={{
              padding: "5px 10px",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ddd",
              borderRadius: "4px",
              cursor: isFetchingRecs ? "not-allowed" : "pointer"
            }}
          >
            {isFetchingRecs ? "Refreshing..." : "Refresh"}
          </button>
        </div>
        <button
          onClick={() => setShowComparison(true)}
          disabled={selectedProducts.length < 2}
          style={{
            padding: "10px 15px",
            backgroundColor: selectedProducts.length >= 2 ? "#FF9900" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: selectedProducts.length >= 2 ? "pointer" : "not-allowed"
          }}
        >
          Compare ({selectedProducts.length})
        </button>
      </div>

      {error && (
        <div style={{ 
          padding: "10px", 
          backgroundColor: "#ffebee", 
          color: "#c62828",
          marginBottom: "20px",
          borderRadius: "4px"
        }}>
          Error: {error}
        </div>
      )}

      {isFetchingRecs ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>Loading recommendations...</p>
        </div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p>No recommendations available. Try refreshing or check back later.</p>
        </div>
      ) : (
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", 
          gap: "20px"
        }}>
          {products.map(product => (
            <Product
              key={product._id || product.id}
              product={product}
              onClick={(p) => setSelectedProduct(p)}
              isSelected={selectedProducts.some(p => (p._id || p.id) === (product._id || product.id))}
              onSelect={handleSelectProduct}
            />
          ))}
        </div>
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
          isLoading={isLoading}
        />
      )}

      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default Recommendations;