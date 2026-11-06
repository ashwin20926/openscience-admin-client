// useAuth.js
import { useState, useCallback, useEffect } from "react";
import axiosInstance from "./axiosInstance";
import { useNavigate } from "react-router-dom";

const useAuth = () => {
  const [user, setUser] = useState(null); // Could store email, role, etc.
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Restore user from storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("userInfo") || sessionStorage.getItem("userInfo");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse stored user:", err);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email: any, password: any, rememberMe: any) => {
      try {
        setError(null)
        setLoading(true);
        if (email && password) {
          const res = await axiosInstance.post("login", {
            email,
            password,
            rememberMe,
          });
          const { user } = res.data;

          if (rememberMe) {
            localStorage.setItem("userInfo", JSON.stringify(user)); // Persistent
          } else {
            sessionStorage.setItem("userInfo", JSON.stringify(user)); // Temporary
          }

          setUser(user);
          setLoading(false);
          setError(null);
          if (user.roleName === "Admin") {
            navigate("dashboard");
          } else {
            navigate("dashboard");
          }
        } else {
          setLoading(false);
          setError(null)
        }
      } catch (err: any) {
        setLoading(false);
        setError(err.response?.data?.error || "Login failed");
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
      sessionStorage.removeItem("authToken");
      sessionStorage.removeItem("userInfo");
    } finally {
      setUser(null);
    }
  }, []);
  
  const updateUser = useCallback((updatedUserData: any) => {setUser((prevUser: any) => {
      const newUser = { ...prevUser, ...updatedUserData };
      // Update storage
      if (localStorage.getItem("userInfo")) {
        localStorage.setItem("userInfo", JSON.stringify(newUser));
      }
      if (sessionStorage.getItem("userInfo")) {
        sessionStorage.setItem("userInfo", JSON.stringify(newUser));
      }
      return newUser;
    });
  }, []);


  return { user, loading, error, login, logout, updateUser };
};



export default useAuth;
