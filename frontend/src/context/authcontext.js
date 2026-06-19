"use client";
import { useRouter } from "next/navigation";
import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const router = useRouter();
  const [token, setToken] = useState(null);

  // Persist auth in localStorage
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("auth"));
    if (saved) {
      setUser(saved.user);
      setToken(saved.token);
    }
  }, []);
  useEffect(() => {
    if (user && token) {
      localStorage.setItem("auth", JSON.stringify({ user, token }));
    } else {
      localStorage.removeItem("auth");
    }
  }, [user, token]);

  const login = (user, token) => {
    setUser(user);
    setToken(token);
    router.push("/");
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    toast("Logout SucessFully!!");
    router.push("/");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
