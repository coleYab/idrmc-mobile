import { setAuthTokenProvider } from "@/api/auth";
import { useAuth } from "@clerk/expo";
import { useEffect } from "react";

const ApiAuthTokenBridge = () => {
  const { getToken, isLoaded } = useAuth();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    setAuthTokenProvider(() => getToken());

    return () => {
      setAuthTokenProvider(null);
    };
  }, [getToken, isLoaded]);

  return null;
};

export default ApiAuthTokenBridge;