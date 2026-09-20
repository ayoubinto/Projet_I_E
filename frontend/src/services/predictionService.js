import api from './api';

export const predictRetard = async(operationData) => {
    const response = await api.post(
        "/predictions/retard/",
        operationData
    );

    return response.data;
};

export const getPredictionHistory = async () => {
    const response = await api.get("/predictions/history");
    return response.data;
};