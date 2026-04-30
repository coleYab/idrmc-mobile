import { tabs } from "@/constants/data";
import { lucideIcons } from "@/constants/icons";
import { colors, components } from "@/constants/theme";
import { useAuth } from "@clerk/expo";
// eslint-disable-next-line import/no-named-as-default
import clsx from "clsx";
import { Redirect, Tabs } from "expo-router";
import { useColorScheme } from "nativewind";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabBar = components.tabBar;

const TabIcon = ({ focused, iconType }: TabIconProps) => {
  const IconComponent =
    lucideIcons[
      iconType === "plus"
        ? "Plus"
        : iconType === "list"
          ? "List"
          : iconType === "home"
            ? "Home"
            : iconType === "alertTriangle"
              ? "AlertTriangle"
              : iconType === "settings"
                ? "Settings"
                : iconType === "bell"
                  ? "Bell"
                  : "Home"
    ];
  return (
    <View className="tabs-icon">
      <View className={clsx("tabs-pill", focused && "tabs-active")}>
        {IconComponent && <IconComponent size={24} color="#c2d3cd" />}
      </View>
    </View>
  );
};
const TabLayout = () => {
  const { isSignedIn, isLoaded } = useAuth();
  const { colorScheme } = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";

  // Wait for auth to load before rendering anything
  if (!isLoaded) {
    return null;
  }

  // Redirect to onboarding if user is not authenticated
  if (!isSignedIn) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: "absolute",
          bottom: Math.max(insets.bottom, tabBar.horizontalInset),
          height: tabBar.height,
          marginHorizontal: tabBar.horizontalInset,
          borderRadius: tabBar.radius,
          backgroundColor: isDark ? colors.foreground : colors.primary,
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarItemStyle: {
          paddingVertical: tabBar.height / 2 - tabBar.iconFrame / 1.6,
        },
        tabBarIconStyle: {
          width: tabBar.iconFrame,
          height: tabBar.iconFrame,
          alignItems: "center",
        },
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.title,
            tabBarIcon: ({ focused }) => (
              <TabIcon focused={focused} iconType={tab.iconType} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
};

export default TabLayout;
