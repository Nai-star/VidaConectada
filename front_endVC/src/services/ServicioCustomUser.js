import axios from "axios";
const API_URL = "http://localhost:8000/api";

export async function checkCustomUser(cedula) {
  try {
    const res = await axios.get(`${API_URL}/customuser/${cedula}/`);
    return res.data;
  } catch (error) {
    return null;
  }
}
