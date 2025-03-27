import React, { useState, useEffect } from "react";
import Signup from "./Signup.jsx";
import Login from "./Login.jsx";
import Profile from "./Profile.jsx";
import Chatbot from "./Chatbot.jsx";
import Recommendations from "./Recommendations.jsx";

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("chatbot");

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentPage("chatbot");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setIsAuthenticated(false);
    setCurrentPage("login");
  };

  return (
    <div style={styles.container}>
      <nav style={styles.navbar}>
        <button onClick={() => setCurrentPage("chatbot")} style={styles.navButton}>AI-Search</button>
        <button onClick={() => setCurrentPage("recommendations")} style={styles.navButton}>Recommendations</button>
        
        {isAuthenticated ? (
          <button onClick={handleLogout} style={styles.navButton}>Logout</button>
        ) : (
          <>
            <button onClick={() => setCurrentPage("login")} style={styles.navButton}>Login</button>
            <button onClick={() => setCurrentPage("signup")} style={styles.navButton}>Signup</button>
          </>
        )}
      </nav>

      <div style={styles.content}>
        {currentPage === "signup" && <Signup />}
        {currentPage === "login" && <Login onLogin={handleLogin} />}
        {currentPage === "chatbot" && <Chatbot />}
        {currentPage === "recommendations" && <Recommendations />}
      </div>
    </div>
  );
};

const styles = {
  container: { 
    maxWidth: "900px", 
    margin: "auto", 
    padding: "20px", 
    fontFamily: "Arial, sans-serif" 
  },
  navbar: { 
    display: "flex", 
    justifyContent: "center", 
    gap: "10px", 
    marginBottom: "20px" 
  },
  navButton: { 
    padding: "10px", 
    backgroundColor: "#FF9900", 
    color: "#fff", 
    border: "none", 
    borderRadius: "5px", 
    cursor: "pointer" 
  },
  content: { 
    textAlign: "center" 
  }
};

export default App;