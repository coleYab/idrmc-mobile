import { usersService } from "@/api/services/users";
import { useAuth, useUser } from "@clerk/expo";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

type PushTokenRegistrationStatus =
  | "idle"
  | "requesting-permission"
  | "registering"
  | "registered"
  | "skipped"
  | "error";

export const usePushTokenRegistration = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [status, setStatus] = useState<PushTokenRegistrationStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const isSyncingRef = useRef(false);
  const lastRegisteredTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || Platform.OS === "web") {
      return;
    }

    const projectId =
      Constants.easConfig?.projectId ??
      Constants.expoConfig?.extra?.eas?.projectId;

    if (!projectId) {
      console.warn("Skipping push token registration: missing project ID.");
      setStatus("skipped");
      return;
    }

    let isActive = true;

    const syncPushToken = async () => {
      if (isSyncingRef.current) {
        return;
      }

      isSyncingRef.current = true;
      setError(null);

      try {
        setStatus("requesting-permission");

        const currentPermissions = await Notifications.getPermissionsAsync();
        let nextStatus = currentPermissions.status;

        if (currentPermissions.status !== "granted") {
          const requestedPermissions = await Notifications.requestPermissionsAsync();
          nextStatus = requestedPermissions.status;
        }

        if (nextStatus !== "granted") {
          if (isActive) {
            setStatus("skipped");
          }

          return;
        }

        if (!isActive) {
          return;
        }

        setStatus("registering");

        const pushTokenResponse = await Notifications.getExpoPushTokenAsync({
          projectId,
        });
        const pushToken = pushTokenResponse.data;

        if (lastRegisteredTokenRef.current === pushToken) {
          if (isActive) {
            setStatus("registered");
          }

          return;
        }

        if (!user?.id) {
          throw new Error("Unable to resolve the current user ID.");
        }

        await usersService.registerPushToken({
          pushToken,
          clerkUserId: user.id,
        });

        lastRegisteredTokenRef.current = pushToken;

        if (isActive) {
          setStatus("registered");
        }
      } catch (registrationError) {
        console.warn("Push token registration failed.", registrationError);

        if (isActive) {
          setStatus("error");
          setError(
            registrationError instanceof Error
              ? registrationError.message
              : "Push token registration failed.",
          );
        }
      } finally {
        isSyncingRef.current = false;
      }
    };

    void syncPushToken();

    const subscription = Notifications.addPushTokenListener(() => {
      void syncPushToken();
    });

    return () => {
      isActive = false;
      subscription.remove();
    };
  }, [isLoaded, isSignedIn, user?.id]);

  return {
    error,
    isRegistering:
      status === "requesting-permission" || status === "registering",
    status,
  };
};