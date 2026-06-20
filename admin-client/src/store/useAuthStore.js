import { create } from 'zustand';

// Minimal auth store for admin-client – no Firebase integration needed here.
const useAuthStore = create(() => ({
  user: null,
  loading: false,
  error: null,
  // Placeholder – can be called by components without side‑effects.
  initAuthListener: () => {}
}));

export default useAuthStore;
