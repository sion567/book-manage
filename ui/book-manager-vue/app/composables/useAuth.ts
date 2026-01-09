export const useAuth = () => {
  const store = useAuthStore()

  // 快捷判断权限，不涉及 AJAX
  const hasRole = (role: string) => store.user?.role?.includes(role)
  const isLoggedIn = computed(() => !!store.user)

  return { hasRole, isLoggedIn }
}
