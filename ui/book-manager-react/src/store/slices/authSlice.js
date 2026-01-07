import { createSlice } from '@reduxjs/toolkit';
import { authApi } from '../services/authApi';

const initialState = {
  user: null,
  isAuthenticated: !!localStorage.getItem('access_token'),
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      localStorage.clear();
    },
  },
  // 关键：监听authApi的成功结果
  extraReducers: (builder) => {
    builder.addMatcher(
      // 自动监听 authApi 中 login 这个 endpoint 的成功状态
      authApi.endpoints.login.matchFulfilled,
      (state, {payload}) => {  // 第二个参数是完整的 action 对象
        state.user = payload.user;
        state.token = payload.access_token;
        // 登录后的状态同步在这里一站式完成
      },
    );
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;
