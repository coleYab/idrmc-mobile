import ApiAuthTokenBridge from "@/components/ApiAuthTokenBridge";
import PushTokenRegistration from "@/components/PushTokenRegistration";
import "@/global.css";
import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { useFonts } from "expo-font";
import * as Notifications from "expo-notifications";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { SafeAreaView, Text, View } from "react-native";

// Handle foreground notifications so they show as alerts
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;
const queryClient = new QueryClient();

const MissingConfigScreen = () => (
  <SafeAreaView className="flex-1 items-center justify-center bg-background px-6">
    <View className="w-full max-w-md rounded-3xl bg-card px-6 py-8">
      <Text className="text-center text-2xl font-sans-bold text-primary">
        App configuration required
      </Text>
      <Text className="mt-3 text-center text-base font-sans-medium text-foreground/80">
        The Clerk publishable key is missing, so the app cannot finish startup.
      </Text>
      <Text className="mt-4 text-center text-sm font-sans-regular text-foreground/70">
        Set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in the build environment and rebuild the Android app.
      </Text>
    </View>
  </SafeAreaView>
);

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    "sans-regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "sans-bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "sans-medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "sans-semibold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
    "sans-extrabold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "sans-light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  if (!publishableKey) {
    return <MissingConfigScreen />;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <ApiAuthTokenBridge />
        <PushTokenRegistration />
        <Stack screenOptions={{ headerShown: false }} />
      </QueryClientProvider>
    </ClerkProvider>
  );
}
