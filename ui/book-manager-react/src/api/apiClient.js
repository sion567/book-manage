const BASE_URL = 'http://localhost:8080/api/v1';

let isRefreshing = false;
let refreshSubscribers = [];

const apiClient = async (endpoint, { body, ...customConfig } = {}) => {
  const token = localStorage.getItem('access_token');

  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;

  const config = {
    method: body ? 'POST' : 'GET',
    ...customConfig,
    headers: {
      ...headers,
      ...customConfig.headers,
    },
  };
  if (body) config.body = JSON.stringify(body);

  const request = async () => {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    if (response.status === 403 && !endpoint.includes('/auth/refresh-token')) {
      if (!isRefreshing) {
        isRefreshing = true;
        const refreshToken = localStorage.getItem('refresh_token');

        if (!refreshToken) {
          handleLogout();
          return Promise.reject('No refresh token available');
        }

        try {
          const refreshRes = await fetch(`${BASE_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
          });

          if (!refreshRes.ok) throw new Error('Refresh failed');

          const newTokens = await refreshRes.json();
          localStorage.setItem('access_token', newTokens.access_token);
          localStorage.setItem('refresh_token', newTokens.refresh_token);

          isRefreshing = false;
          onTokenRefreshed(newTokens.access_token);

          // 重新执行当前请求
          config.headers.Authorization = `Bearer ${newTokens.access_token}`;
          return fetch(`${BASE_URL}${endpoint}`, config).then((res) => res.json());
        } catch (err) {
          handleLogout();
          return Promise.reject('Session expired');
        }
      }

      // 已经在刷新中，当前请求要挂起
      return new Promise((resolve) => {
        refreshSubscribers.push((newToken) => {
          config.headers.Authorization = `Bearer ${newToken}`;
          resolve(fetch(`${BASE_URL}${endpoint}`, config).then((res) => res.json()));
        });
      });
    }

    if (response.status === 204) return null;
    if (!response.ok) return Promise.reject(await response.json()); // fetch 在遇到 HTTP 错误状态码（如 404、500）时不会自动抛出异常
    return response.json();
  };

  return request();
};

const onTokenRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

const handleLogout = () => {
  localStorage.clear();
  window.location.href = '/login';
};

export const api = {
  get: (url, config) => apiClient(url, { ...config, method: 'GET' }),
  post: (url, body, config) => apiClient(url, { ...config, method: 'POST', body }),
  put: (url, body, config) => apiClient(url, { ...config, method: 'PUT', body }),
  delete: (url, config) => apiClient(url, { ...config, method: 'DELETE' }),
};
