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

const plantationService = {
  uploadPlantationData,
  getPlantationsByProject,
};

export default plantationService;
