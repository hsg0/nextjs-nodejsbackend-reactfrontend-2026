// src/checkAuth/authCheck.js
"use client";

import { useEffect, useState } from "react";
import callBackend from "../lib/callBackend.js";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const useAuthCheck = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  const router = useRouter();

  useEffect(() => {
    let alive = true;

    const checkAuth = async () => {
      try {
        console.log("➡️ AuthCheck: calling GET /web/api/auth/profile");
        const response = await callBackend.get("/web/api/auth/profile");
        const webUser = response?.data?.webUser || null;

        console.log("✅ AuthCheck response webUser:", webUser);

        if (webUser?.webUserId) {
          if (!alive) return;
          setIsAuthenticated(true);
          setUser(webUser);
        } else {
          if (!alive) return;
          setIsAuthenticated(false);
          setUser(null);
          console.log("❌ AuthCheck failed: redirecting to /login");
          router.replace("/login");
        }
      } catch (error) {
        console.log("❌ Auth check error:", error?.response?.data || error?.message || error);

        if (!alive) return;
        setIsAuthenticated(false);
        setUser(null);

        toast.error("Authentication check failed. Please log in again.");
        router.replace("/login");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    };

    checkAuth();

    return () => {
      alive = false;
    };
  }, [router]);

  return { isAuthenticated, loading, user };
};

export default useAuthCheck;