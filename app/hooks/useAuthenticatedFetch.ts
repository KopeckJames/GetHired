import { useAuth } from "~/context/AuthContext";
import { useNavigate } from "@remix-run/react";
import { useEffect } from "react";

export function useAuthenticatedFetch() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/?error=Please%20log%20in%20to%20continue');
    }
  }, [user, navigate]);

  return async (input: RequestInfo | URL, init?: RequestInit) => {
    try {
      // Verify authentication status
      const verifyResponse = await fetch('/auth/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!verifyResponse.ok) {
        navigate('/?error=Please%20log%20in%20to%20continue');
        throw new Error("Not authenticated");
      }

      const response = await fetch(input, {
        ...init,
        credentials: 'include',
      });

      if (response.status === 401) {
        navigate('/?error=Session%20expired.%20Please%20log%20in%20again');
        throw new Error("Unauthorized");
      }

      return response;
    } catch (error) {
      if (error instanceof Error && error.message === "Not authenticated") {
        throw error;
      }
      console.error('Request failed:', error);
      throw new Error("Failed to make request");
    }
  };
}

export function useRequireAuth() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch('/auth/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          navigate('/?error=Please%20log%20in%20to%20continue');
        }
      } catch (error) {
        console.error('Auth verification failed:', error);
        navigate('/?error=Authentication%20failed.%20Please%20try%20again.');
      }
    };

    verifyAuth();
  }, [navigate]);

  return { isAuthenticated: !!user };
}
