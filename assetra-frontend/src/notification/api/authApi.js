import axios from 'axios';

const API = import.meta.env.VITE_API_BASE_URL;

export const getCurrentUser = async (token) => {
    const response = await axios.get(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
};

export const loginWithGoogle = () => {
    window.location.href = `${API}/oauth2/authorization/google`;
};