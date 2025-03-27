import React from 'react';

const ComparisonSidebar = ({ 
  selectedProducts, 
  onCompare, 
  onClose, 
  comparisonResult,
  isLoading 
}) => {
  const formatComparisonResult = (result) => {
    if (!result) return null;
    
    // Split into sections if it's already formatted with ### headers
    if (result.includes('###')) {
      return result.split('###').map((section, index) => {
        if (!section.trim()) return null;
        const [title, ...content] = section.split('\n');
        return (
          <div key={index} style={{ marginBottom: '20px' }}>
            <h4 style={{ 
              color: '#333',
              borderBottom: '1px solid #eee',
              paddingBottom: '8px',
              marginBottom: '12px'
            }}>
              {title.trim()}
            </h4>
            <div style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
              {content.join('\n').trim()}
            </div>
          </div>
        );
      });
    }

    // Fallback for plain text
    return (
      <div style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
        {result}
      </div>
    );
  };

  return (
    <div style={{
      position: "fixed",
      right: "0",
      top: "0",
      height: "100vh",
      width: "800px",  // Increased from 350px
      backgroundColor: "#fff",
      boxShadow: "-2px 0 15px rgba(0,0,0,0.15)",
      padding: "25px",
      overflowY: "auto",
      zIndex: 1000
    }}>
      <button 
        onClick={onClose}
        style={{
          position: "absolute",
          top: "15px",
          right: "15px",
          background: "none",
          border: "none",
          fontSize: "24px",
          cursor: "pointer",
          color: "#666",
          '&:hover': {
            color: "#333"
          }
        }}
      >
        ×
      </button>

      <h3 style={{
        margin: "0 0 25px 0",
        color: "#333",
        fontSize: "20px",
        fontWeight: "600"
      }}>
        Compare Products ({selectedProducts.length})
      </h3>
      
      <div style={{ margin: "20px 0" }}>
        {selectedProducts.map(product => (
          <div key={product._id} style={{
            display: "flex",
            alignItems: "center",
            padding: "12px",
            marginBottom: "12px",
            border: "1px solid #eee",
            borderRadius: "6px",
            backgroundColor: "#fafafa",
            transition: "all 0.2s",
            '&:hover': {
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
            }
          }}>
            <img
              src={product.image_url || "https://via.placeholder.com/60"}
              alt={product.title}
              style={{
                width: "60px",
                height: "60px",
                objectFit: "contain",
                marginRight: "15px",
                borderRadius: "4px"
              }}
            />
            <div style={{ flex: 1 }}>
              <p style={{ 
                margin: "0 0 5px 0", 
                fontWeight: "500",
                fontSize: "15px"
              }}>
                {product.title}
              </p>
              <p style={{ 
                margin: 0, 
                color: "#B12704",
                fontWeight: "600",
                fontSize: "16px"
              }}>
                ${product.final_price || product.price}
              </p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onCompare(selectedProducts)}
        disabled={selectedProducts.length < 2 || isLoading}
        style={{
          width: "100%",
          padding: "14px",
          backgroundColor: selectedProducts.length >= 2 ? "#FF9900" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: selectedProducts.length >= 2 ? "pointer" : "not-allowed",
          fontSize: "16px",
          fontWeight: "600",
          marginBottom: "25px",
          transition: "all 0.2s",
          '&:hover': {
            backgroundColor: selectedProducts.length >= 2 ? "#e68a00" : "#ccc"
          }
        }}
      >
        {isLoading ? (
          <span>Comparing... <i className="fas fa-spinner fa-spin"></i></span>
        ) : (
          "Compare Now"
        )}
      </button>

      {comparisonResult && (
        <div style={{ 
          marginTop: "25px", 
          borderTop: "1px solid #eee", 
          paddingTop: "20px" 
        }}>
          <h4 style={{
            color: "#333",
            fontSize: "18px",
            marginBottom: "20px",
            fontWeight: "600"
          }}>
            Comparison Results
          </h4>
          <div style={{ 
            backgroundColor: "#f9f9f9",
            padding: "20px",
            borderRadius: "6px",
            border: "1px solid #eee"
          }}>
            {formatComparisonResult(comparisonResult)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparisonSidebar;