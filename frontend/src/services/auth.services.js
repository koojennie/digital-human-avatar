const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const authServices = {
  async loginAdmin(username, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    });

    const jsonResult = await response.json();

    if (!response.ok) {
      throw new Error(jsonResult.message || "Failed to login");
    }

    const token = jsonResult.data?.token;
    const user = jsonResult.data?.user;

    // 3. Simpan ke localStorage jika data valid
    if (token && user) {
      localStorage.setItem("token", token);
      localStorage.setItem("admin_user", JSON.stringify(user));
    }

    return jsonResult.data;
  },

  logOut() {
    localStorage.removeItem("token");
    localStorage.removeItem("admin_user");
    window.location.href = "/login";
  },

  getToken() {
    return localStorage.getItem("token");
  },

  getAuthHeader() {
    const token = this.getToken();
    return {
      Authorization: token ? `Bearer ${token}` : "",
    };
  },
};
