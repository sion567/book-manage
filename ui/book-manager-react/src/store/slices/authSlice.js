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
    setUser: (state, action) => { state.user = action.payload; },
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
      (state, action) => {  // 第二个参数是完整的 action 对象
        console.log("完整的 action:", action);
        state.token = action.payload.access_token;
        // 登录后的状态同步在这里一站式完成
      },
    )
    // 监听 getProfile 成功，自动更新 user 状态
    .addMatcher(
      authApi.endpoints.getProfile.matchFulfilled,
      (state, { payload }) => {
        state.user = payload;
      }
    );
  },
});

export const { setUser, logout } = authSlice.actions;
export default authSlice.reducer;
