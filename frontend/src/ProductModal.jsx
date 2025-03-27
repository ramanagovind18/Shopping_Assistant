import React, { useState } from 'react';

const ProductModal = ({ product, onClose }) => {
  const [showFullReview, setShowFullReview] = useState(false);

  const toggleReview = () => {
    setShowFullReview((prev) => !prev);
  };

  return (
    <div style={{
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      overflowY: "auto"
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "10px",
        maxWidth: "800px",
        width: "90%",
        maxHeight: "90%",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column"
      }}>
        <h2 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "20px" }}>
          {product.title}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <div style={{ width: "100%", display: "flex", justifyContent: "center", marginBottom: "20px" }}>
            <img
              src={product.image_url || "https://via.placeholder.com/400"}
              alt={product.title}
              style={{
                width: "100%",
                maxWidth: "400px",
                borderRadius: "5px",
              }}
            />
          </div>
          <div style={{ width: "100%" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "400", marginBottom: "10px" }}>
              Brand: {product.brand}
            </h3>
            <p style={{ fontSize: "16px", color: "#555", marginBottom: "20px" }}>
              <strong>Description:</strong> {product.description}
            </p>
            <p style={{ fontSize: "16px", fontWeight: "600", color: "#B12704", marginBottom: "20px" }}>
              Price: ${product.final_price || product.price} {product.currency}
            </p>
            <p style={{ fontSize: "16px", color: "#555", marginBottom: "10px" }}>
              <strong>Rating:</strong> ⭐ {product.rating ? product.rating.toFixed(1) : "3.0"}
            </p>
            <p style={{ fontSize: "16px", color: "#555", marginBottom: "10px" }}>
              <strong>Availability:</strong> {product.availability || "In Stock"}
            </p>
            <div style={{ fontSize: "16px", color: "#555", marginBottom: "20px" }}>
              <strong>Review:</strong>
              <div style={{ 
                maxHeight: showFullReview ? "none" : "60px",
                overflow: "hidden",
                transition: "max-height 0.3s ease"
              }}>
                {product.review || "No reviews yet."}
              </div>
              <button
                onClick={toggleReview}
                style={{
                  color: "#FF9900",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  marginTop: "5px",
                  fontSize: "14px"
                }}
              >
                {showFullReview ? "Show Less" : "Show More"}
              </button>
            </div>
            <button
              onClick={onClose}
              style={{
                backgroundColor: "#FF9900",
                color: "#fff",
                padding: "10px 15px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
                fontSize: "16px"
              }}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;