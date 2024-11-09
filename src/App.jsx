import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Editor from "./pages/Editor";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import { Oval } from "react-loader-spinner";
import { Box } from "@mui/material";

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const socket = io("https://collabify-backend.onrender.com");

    socket.on("connect", () => {
      console.log("Connected to server");
      setLoading(false);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setLoading(true);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <>
      <div>
        <ToastContainer
          position="bottom-right"
          autoClose={1500}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
      </div>
      <Router>
        {loading ? (
          <Box>
            <Oval
              height={80}
              width={80}
              color="rgba(52, 152, 219, 1)"
              secondaryColor="rgba(0, 0, 0, 0.1)"
              ariaLabel="loading"
              strokeWidth={4}
              strokeWidthSecondary={4}
            />
          </Box>
        ) : (
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/editor/:roomId" element={<Editor />} />
          </Routes>
        )}
      </Router>
    </>
  );
}

export default App;
