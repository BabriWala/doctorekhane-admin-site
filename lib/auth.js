// eslint-disable-next-line @typescript-eslint/ban-ts-comment
//@ts-nocheck
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import api, { setAccessToken, clearAccessToken } from "./api";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const login = async (email, password) => {
    try {
      const { data } = await api.post("/auth/login", {
        email: email.trim().toLowerCase(),
        password,
      });
      setAccessToken(data.accessToken);
      setUser(data.user);
      setLoading(false);
      return { success: true, user: data.user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Login failed",
      };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (error) {
    } finally {
      clearAccessToken();
      setUser(null);
      router.push("/login");
    }
  };

  const getMe = async () => {
    const response = await api.get("/auth/me");
    setUser(response?.data?.user);
    return response?.data?.user;
  };

  // Init auth on first render
  useEffect(() => {
    // ❗ Skip auth check on the login page
    if (pathname === "/login") {
      setLoading(false);
      return;
    }

    (async () => {
      try {
        await getMe();
      } catch (error) {
        clearAccessToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [pathname]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        getMe,
        isAuthenticated: !!user,
        isAdmin: ["admin", "superadmin"].includes(
          user?.account?.role || user?.role,
        ),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
