import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

// Components
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RoomDetails from "./pages/RoomDetails";
import MyBookings from "./pages/MyBookings";
import OwnerDashboard from "./pages/OwnerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import BookingDetails from "./pages/BookingDetails";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/room/:id" element={<RoomDetails />} />
            <Route
              path="/booking/:id"
              element={
                <PrivateRoute>
                  <BookingDetails />
                </PrivateRoute>
              }
            />

            <Route
              path="/my-bookings"
              element={
                <PrivateRoute role="client">
                  <MyBookings />
                </PrivateRoute>
              }
            />

            <Route
              path="/owner/dashboard"
              element={
                <PrivateRoute role="proprietaire">
                  <OwnerDashboard />
                </PrivateRoute>
              }
            />

            <Route
              path="/admin/dashboard"
              element={
                <PrivateRoute role="admin">
                  <AdminDashboard />
                </PrivateRoute>
              }
            />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
