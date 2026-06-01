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
      console.log("usePushTokenRegistration: skipped (isLoaded=", isLoaded, "isSignedIn=", isSignedIn, "platform=", Platform.OS, ")");
      return;
    }

    const projectId =
      Constants.easConfig?.projectId ??
      Constants.expoConfig?.extra?.eas?.projectId;

    console.log("usePushTokenRegistration: projectId →", projectId);

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

        // Android 8+ requires a notification channel
        if (Platform.OS === "android") {
          await Notifications.setNotificationChannelAsync("default", {
            name: "Default",
            importance: Notifications.AndroidImportance.HIGH,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: "#FF231F7A",
          });
          console.log("usePushTokenRegistration: Android channel created");
        }

        const currentPermissions = await Notifications.getPermissionsAsync();
        let nextStatus = currentPermissions.status;

        console.log("usePushTokenRegistration: current permission →", nextStatus);

        if (currentPermissions.status !== "granted") {
          const requestedPermissions = await Notifications.requestPermissionsAsync();
          nextStatus = requestedPermissions.status;
          console.log("usePushTokenRegistration: requested permission →", nextStatus);
        }

        if (nextStatus !== "granted") {
          console.log("usePushTokenRegistration: permission denied, skipping");
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

        console.log("usePushTokenRegistration: pushToken →", pushToken);

        if (lastRegisteredTokenRef.current === pushToken) {
          console.log("usePushTokenRegistration: token unchanged, skipping");

          if (isActive) {
            setStatus("registered");
          }

          return;
        }

        if (!user?.id) {
          throw new Error("Unable to resolve the current user ID.");
        }

        console.log("usePushTokenRegistration: registering token for user", user.id);
        await usersService.registerPushToken({
          pushToken,
          clerkUserId: user.id,
        });

        console.log("usePushTokenRegistration: POST /push-token → success");
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
      console.log("usePushTokenRegistration: push token changed, re-registering");
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
