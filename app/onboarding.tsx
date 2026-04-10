import images from "@/constants/images";
import { useAuth } from "@clerk/expo";
import { Redirect, useRouter } from "expo-router";
import { Image, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const Onboarding = () => {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <SafeAreaView
      className="flex-1"
      style={{ flex: 1, backgroundColor: "#ff6303" }}
    >
      {/* Replaced View with ScrollView. 
        Using contentContainerClassName for the padding and flex-grow 
        (if using NativeWind v4), otherwise fallback to contentContainerStyle. 
      */}
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 20,
          paddingBottom: 32,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View className="mt-2 overflow-hidden rounded-[26px]">
          <Image
            source={images.splashPattern}
            className="h-[420px] w-full"
            resizeMode="cover"
          />
        </View>

        <View className="my-8">
          <Text className="text-5xl font-sans-bold text-background">
            Gain Financial Clarity
          </Text>
          <Text className="mt-3 text-center text-lg font-sans-medium text-background/90">
            Track, analyze and cancel with ease
          </Text>
        </View>

        {/* mt-auto relies on flexGrow: 1 in the ScrollView to push this to the bottom */}
        <Pressable
          onPress={() => router.push("/(auth)/sign-up")}
          className="mt-auto items-center rounded-full bg-white py-5"
        >
          <Text className="text-lg font-sans-bold text-primary">
            Get Started
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Onboarding;
