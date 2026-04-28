import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0b3d34",
            color: "#eafaf3",
            border: "1px solid #004d3a",
            borderRadius: 12,
            fontSize: 13,
            padding: "10px 14px",
          },
          success: {
            iconTheme: { primary: "#00e0aa", secondary: "#0b3d34" },
          },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
