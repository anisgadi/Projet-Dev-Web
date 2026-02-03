import axios from "axios";

const API_URL = "/api/rooms";

export const getRooms = async (params = {}) => {
  try {
    const res = await axios.get(API_URL, { params });
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getRoom = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const createRoom = async (roomData) => {
  try {
    const res = await axios.post(API_URL, roomData);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateRoom = async (id, roomData) => {
  try {
    const res = await axios.put(`${API_URL}/${id}`, roomData);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteRoom = async (id) => {
  try {
    const res = await axios.delete(`${API_URL}/${id}`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getOwnerRooms = async () => {
  try {
    const res = await axios.get(`${API_URL}/owner/me`);
    return res.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
