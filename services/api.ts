import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest?.url?.indexOf('/auth/login') < 0) {
      originalRequest._retry = true;
      try {
        await api.post('/auth/refresh', {});
        return api(originalRequest);
      } catch (err) {
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        return Promise.reject(err);
      }
    }
    return Promise.reject(error);
  }
);

export const loginUser = async (data: { email: string; password: string }) => {
  const response = await api.post('/auth/login', data);
  return response.data;
};

export const getLecturerDashboard = async () => {
  const response = await api.get('/users/me/dashboard');
  return response.data;
};

export const getLecturerOverviewStats = async () => {
  const response = await api.get('/users/dashboard/overview');
  return response.data;
};

export const getLecturerStudents = async () => {
  const response = await api.get('/users/dashboard/students');
  return response.data;
};

export const getStudentAttendanceHeatmap = async (
  studentId: string,
  params?: { courseId?: string; from?: string; to?: string },
) => {
  const response = await api.get(
    `/attendance/lecturer/students/${studentId}/heatmap`,
    { params },
  );
  return response.data;
};

export const getLecturerCourses = async () => {
  const response = await api.get('/courses/');
  return response.data;
};

export const deleteQuiz = async (quizId: string) => {
  const response = await api.delete(`/topics/quizzes/${quizId}`);
  return response.data;
};

export const logout = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getTopicDetails = async (topicId: string) => {
  const response = await api.get(`/topics/${topicId}`);
  return response.data;
};

export const getTopicLecturerOverview = async (topicId: string) => {
  const response = await api.get(`/topics/${topicId}/lecturer-overview`);
  return response.data;
};

export const createLiveSchedule = async (data: any) => {
  const response = await api.post('/live/schedule', data);
  return response.data;
};

export const getCourseSchedules = async (courseId: string) => {
  const response = await api.get(`/live/course/${courseId}`);
  return response.data;
};

export const getLecturerSchedules = async () => {
  const response = await api.get('/live/lecturer');
  return response.data;
};

export const generateLiveToken = async (scheduleId: string) => {
  const response = await api.post(`/live/token/${scheduleId}`);
  return response.data;
};

export const endLiveSchedule = async (scheduleId: string) => {
  const response = await api.post(`/live/end/${scheduleId}`);
  return response.data;
};

export const removeLiveParticipant = async (scheduleId: string, identity: string) => {
  const response = await api.post(`/live/remove-participant/${scheduleId}`, { identity });
  return response.data;
};

export const logoutUser = async () => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export default api;
