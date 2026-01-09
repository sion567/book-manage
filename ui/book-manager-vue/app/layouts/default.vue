<script setup lang="ts">
const { isLoggedIn, user, logout } = useAuth()
</script>

<template>
  <div>
    <nav class="navbar">
      <div class="nav-brand">
        <NuxtLink to="/">📚 图书管理</NuxtLink>
      </div>

      <div class="nav-links">
        <!-- 基础导航 -->
        <template v-if="isLoggedIn">
          <NuxtLink
            to="/"
            active-class="active"
          >控制台</NuxtLink>
          <NuxtLink
            to="/books"
            active-class="active"
          >图书库</NuxtLink>
        </template>

        <div class="nav-auth">
          <template v-if="isLoggedIn">
            <span class="user-greeting">你好, {{ user?.firstname }}</span>
            <button
              class="btn-logout"
              @click="logout"
            >
              退出
            </button>
          </template>
          <template v-else>
            <NuxtLink
              to="/login"
              class="btn-login"
            >登录</NuxtLink>
            <NuxtLink
              to="/register"
              class="btn-register"
            >注册</NuxtLink>
          </template>
        </div>
      </div>
    </nav>
    <slot />
  </div>
</template>

<style scoped>
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  height: 64px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;

  .nav-brand a {
    font-size: 1.25rem;
    font-weight: bold;
    color: #1976d2;
    text-decoration: none;
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 1.5rem;

    a {
      text-decoration: none;
      color: #666;
      font-weight: 500;
      transition: color 0.2s;

      &:hover {
        color: #1976d2;
      }
      &.active {
        color: #1976d2;
        border-bottom: 2px solid #1976d2;
      }
    }
  }

  .nav-auth {
    display: flex;
    align-items: center;
    gap: 1rem;
    border-left: 1px solid #eee;
    padding-left: 1.5rem;

    .user-greeting {
      font-size: 0.9rem;
      color: #444;
    }

    button,
    .btn-login,
    .btn-register {
      padding: 0.4rem 1rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.9rem;
      text-decoration: none;
    }

    .btn-logout {
      background: none;
      border: 1px solid #ff4444;
      color: #ff4444;
      &:hover {
        background: #ff4444;
        color: white;
      }
    }

    .btn-register {
      background: #1976d2;
      color: white;
      &:hover {
        background: #1565c0;
      }
    }
  }
}
</style>
