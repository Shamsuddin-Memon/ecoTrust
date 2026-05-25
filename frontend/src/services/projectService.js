import axios from 'axios';

const API_URL = 'http://localhost:5000/api/projects';

const createProject = async (projectData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
  const response = await axios.post(API_URL, projectData, config);
  return response.data;
};

const getMyProjects = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await axios.get(`${API_URL}/my-projects`, config);
  return response.data;
};

const getPendingProjects = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(`${API_URL}/admin/pending`, config);
  return response.data;
};

const getGlobalProjects = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(`${API_URL}/global`, config);
  return response.data;
};

const approveProject = async (id, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.put(`${API_URL}/${id}/approve`, {}, config);
  return response.data;
};

const declineProject = async (id, reason, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.put(`${API_URL}/${id}/decline`, { reason }, config);
  return response.data;
};

const getNGOProjects = async (userId, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(`${API_URL}/ngo/${userId}`, config);
  return response.data;
};

const updateProject = async (id, data, token) => {
  const config = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
  const response = await axios.put(`${API_URL}/${id}`, data, config);
  return response.data;
};

const deleteProject = async (id, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.delete(`${API_URL}/${id}`, config);
  return response.data;
};

const getAllProjectsAdmin = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(`${API_URL}/admin/all`, config);
  return response.data;
};

const projectService = {
  createProject,
  getMyProjects,
  getPendingProjects,
  getGlobalProjects,
  approveProject,
  declineProject,
  getNGOProjects,
  updateProject,
  deleteProject,
  getAllProjectsAdmin,
};

export default projectService;
