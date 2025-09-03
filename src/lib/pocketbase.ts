import PocketBase from 'pocketbase';

export const pb = new PocketBase('https://trfapi.yezuri.com');

// Auto cancellation özelliğini tamamen devre dışı bırak
pb.autoCancellation(false);

export type AuthModel = {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  tc?: string;
  city?: string;
  iban?: string;
  role?: string;
};

export const isLoggedIn = () => {
  return pb.authStore.isValid;
};

export const getCurrentUser = () => {
  return pb.authStore.model as AuthModel | null;
};

export const logout = () => {
  pb.authStore.clear();
};
