import { defineStore } from "pinia";
import { ref } from "vue";
import * as userApi from "../api/userApi";

export const useUsersStore = defineStore("users", () => {
  const users = ref([]);
  const user = ref(null);
  const profile = ref(null);
  const isUsers = ref(false);
  const isProfile = ref(false);
  const isProfileChange = ref(false);
  const isProfileChanged = ref(false);
  const isPhotoChange = ref(false);
  const isPasswordChange = ref(false);
  const message = ref("");
  const errors = ref({});

  const finish = (response) => {
    message.value = response.message;
    errors.value = response.data?.field || {};
    return response.status === "success";
  };

  async function fetchUsers() {
    isUsers.value = true;
    const response = await userApi.getUsers();
    if (finish(response)) users.value = response.data.users;
    isUsers.value = false;
  }

  async function fetchProfile() {
    isProfile.value = true;
    const response = await userApi.getMe();
    if (finish(response)) {
      profile.value = response.data.user;
      user.value = response.data.user;
    }
    isProfile.value = false;
  }

  async function changeProfile(name, email) {
    isProfileChange.value = true;
    isProfileChanged.value = false;
    const response = await userApi.updateMe(name, email);
    const success = finish(response);
    if (success) {
      profile.value = response.data.user;
      isProfileChanged.value = true;
    }
    isProfileChange.value = false;
    return success;
  }

  async function changePhoto(file) {
    isPhotoChange.value = true;
    const success = finish(await userApi.updatePhoto(file));
    if (success) await fetchProfile();
    isPhotoChange.value = false;
    return success;
  }

  async function changePassword(password, newPassword, confirmation) {
    isPasswordChange.value = true;
    const response = await userApi.changePassword(
      password,
      newPassword,
      confirmation
    );
    isPasswordChange.value = false;
    return finish(response);
  }

  return {
    users,
    user,
    profile,
    isUsers,
    isProfile,
    isProfileChange,
    isProfileChanged,
    isPhotoChange,
    isPasswordChange,
    message,
    errors,
    fetchUsers,
    fetchProfile,
    changeProfile,
    changePhoto,
    changePassword,
  };
});
