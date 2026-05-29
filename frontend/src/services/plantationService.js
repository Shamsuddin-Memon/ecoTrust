import axios from 'axios';

const API_URL = 'http://localhost:5000/api/plantations';

const uploadPlantationData = async (formData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };

  const response = await axios.post(API_URL, formData, config);
  return response.data;
};

const getPlantationsByProject = async (projectId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await axios.get(`${API_URL}/project/${projectId}`, config);
  return response.data;
};

// ─── Admin Methods ─────────────────────────────────────────
const getPendingPlantations = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(`${API_URL}/admin/pending`, config);
  return response.data;
};

const getPlantationById = async (id, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(`${API_URL}/${id}`, config);
  return response.data;
};

const approvePlantation = async (id, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.put(`${API_URL}/${id}/approve`, {}, config);
  return response.data;
};

const rejectPlantation = async (id, reason, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.put(`${API_URL}/${id}/reject`, { reason }, config);
  return response.data;
};

const uploadMonitoringData = async (id, formData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  };
  const response = await axios.post(`${API_URL}/${id}/monitoring`, formData, config);
  return response.data;
};

const getMonitoringReportsByProject = async (projectId, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(`${API_URL}/project/${projectId}/monitoring`, config);
  return response.data;
};

const simulatePlantationTime = async (id, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.put(`${API_URL}/${id}/simulate-time`, {}, config);
  return response.data;
};

const getMyMonitoringStatus = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  const response = await axios.get(`${API_URL}/my-monitoring-status`, config);
  return response.data;
};

const plantationService = {
  uploadPlantationData,
  getPlantationsByProject,
  getPendingPlantations,
  getPlantationById,
  approvePlantation,
  rejectPlantation,
  uploadMonitoringData,
  getMonitoringReportsByProject,
  simulatePlantationTime,
  getMyMonitoringStatus,
};

export default plantationService;
