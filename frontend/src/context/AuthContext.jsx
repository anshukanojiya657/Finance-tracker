import { createContext, useContext, useState } from "react";
import API from "../api/axios";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const saveUser = (data) => {
    localStorage.setItem("token", data.token);
    const userInfo = { _id: data._id, name: data.name, email: data.email };
    localStorage.setItem("user", JSON.stringify(userInfo));
    setUser(userInfo);
  };

  const login = async (email, password) => {
    const { data } = await API.post("/auth/login", { email, password });
    saveUser(data);
  };

  const signup = async (name, email, password) => {
    const { data } = await API.post("/auth/signup", { name, email, password });
    saveUser(data);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};