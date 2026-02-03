import axios from "axios";

const API_URL = "/api/bookings";

export const createBooking = async (bookingData) => {
  try {
    const res = await axios.post(API_URL, bookingData);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMyBookings = async () => {
  try {
    const res = await axios.get(`${API_URL}/my-bookings`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getOwnerBookings = async () => {
  try {
    const res = await axios.get(`${API_URL}/owner/bookings`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const cancelBooking = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateBookingStatus = async (id, status) => {
  try {
    const res = await axios.put(`${API_URL}/${id}/status`, { statut: status });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
