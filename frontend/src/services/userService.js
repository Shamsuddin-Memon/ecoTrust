import axios from 'axios';

const API_URL = 'http://localhost:5000/api/users';

const getUsers = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(API_URL, config);
  return response.data;
};

const deleteUser = async (id, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.delete(`${API_URL}/${id}`, config);
  return response.data;
};

const userService = {
  getUsers,
  deleteUser,
};

export default userService;
