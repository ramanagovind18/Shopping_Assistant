import React from 'react';

const Product = ({ product, onClick = () => {}, isSelected = false, onSelect = () => {} }) => {
  const handleCheckboxClick = (e) => {
    e.stopPropagation();
    onSelect(product._id || product.id, !isSelected);
  };

  const handleProductClick = () => {
    onClick(product);
  };

  return (
    <div
      onClick={handleProductClick}
      style={{
        padding: "15px",
        border: "1px solid #ddd",
        borderRadius: "5px",
        backgroundColor: isSelected ? "#f0f8ff" : "#fff",
        boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        cursor: "pointer",
        position: "relative",
        transition: "all 0.2s ease",
        ':hover': {
          transform: "translateY(-2px)",
          boxShadow: "0 4px 8px rgba(0,0,0,0.15)"
        }
      }}
    >
      <div 
        onClick={handleCheckboxClick}
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          width: "20px",
          height: "20px",
          backgroundColor: isSelected ? "#FF9900" : "#fff",
          border: `2px solid ${isSelected ? "#FF9900" : "#ddd"}`,
          borderRadius: "4px",
          cursor: "pointer",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        {isSelected && (
          <span style={{ color: "#fff", fontSize: "14px" }}>✓</span>
        )}
      </div>
      
      <img
        src={product.image_url || "https://via.placeholder.com/150?text=No+Image"}
        alt={product.title}
        style={{
          width: "100%",
          height: "150px",
          objectFit: "contain",
          marginBottom: "10px",
          borderRadius: "5px"
        }}
      />
      <div>
        <h4 style={{ fontSize: "16px", marginBottom: "5px" }}>{product.title}</h4>
        <p style={{ color: "#555", marginBottom: "8px" }}>{product.brand}</p>
        <p style={{ color: "#B12704", fontWeight: "bold" }}>
          ${product.final_price || product.price} {product.currency}
        </p>
      </div>
    </div>
  );
};

export default Product;