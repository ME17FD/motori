// services/authService.ts
import api, { setAccessToken, clearAccessToken } from '../api/axiosInstance';
import type {
  LoginRequest,
  SignupRequest,
  AuthResponse,
  RefreshResponse,
} from '../types/auth';
import type { User } from '../types/user';

const storeToken = (accessToken: string): void => {
  setAccessToken(accessToken);
};

const authService = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const { data: response } = await api.post<AuthResponse>('/auth/login', data);
    storeToken(response.accessToken);
    return response;
  },

  signup: async (data: SignupRequest): Promise<AuthResponse> => {
    const { data: response } = await api.post<AuthResponse>('/auth/signup', data);
    storeToken(response.accessToken);
    return response;
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me');
    return data;
  },

  refreshToken: async (): Promise<RefreshResponse> => {
    const { data } = await api.post<RefreshResponse>('/auth/refresh');
    storeToken(data.accessToken);
    return data;
  },

  logout: async (): Promise<void> => {
    await api.post('/auth/logout').finally(() => clearAccessToken());
  },
} as const;

export default authService;