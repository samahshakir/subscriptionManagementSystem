import axios from "axios";

// Base URL for the backend API
const API_URL = "https://localhost:5000/api";
const authToken = localStorage.getItem("authToken");

// Function to register a new user
const register = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users/register`, userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data.message : "Registration failed";
  }
};

// Function to login a user
const login = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/users/login`, userData);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data.message : "Login failed";
  }
};

const fetchSubscriptions = async () => {
  try {
    const response = await fetch(`${API_URL}/subscriptions`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`, // Include the Bearer token in the Authorization header
      },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to fetch subscriptions:", error);
    throw error;
  }
};

const deleteSubscription = async (id) => {
  try {
    const response = await fetch(`${API_URL}/subscriptions/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to delete subscription:", error);
    throw error;
  }
};

const handleUpdateStatus = async (id, isActive) => {
  try {
    const response = await fetch(`${API_URL}/subscriptions/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      console.error(
        "Failed to update subscription status:",
        await response.text()
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error updating subscription status:", error);
    return false;
  }
};

export {
  register,
  login,
  fetchSubscriptions,
  deleteSubscription,
  handleUpdateStatus,
};
