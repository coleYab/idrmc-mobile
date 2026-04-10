import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";

const Index = () => {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Redirect href="/onboarding" />;
};

export default Index;
