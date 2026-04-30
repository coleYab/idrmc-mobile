import Skeleton from "@/components/Skeleton";
import images from "@/constants/images";
import { useClerk, useUser } from "@clerk/expo";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { styled, useColorScheme } from "nativewind";
import { useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useClerk();
  const { user, isLoaded } = useUser();
  const { colorScheme, setColorScheme } = useColorScheme();
  const tabBarHeight = useBottomTabBarHeight();

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saveError, setSaveError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSignOut = async () => {
    await signOut();
  };

  const customAvatarUrl =
    typeof user?.unsafeMetadata?.avatarUrl === "string"
      ? user.unsafeMetadata.avatarUrl
      : "";

  const resolvedAvatarUrl = customAvatarUrl || user?.imageUrl || "";
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  const displayName =
    fullName ||
    user?.fullName ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";
  const isDark = colorScheme === "dark";
  const email = user?.emailAddresses[0]?.emailAddress;

  if (!isLoaded) {
    return (
      <SafeAreaView className="flex-1 bg-background p-5">
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
          showsVerticalScrollIndicator={false}
        >
          <Skeleton
            height={34}
            width={170}
            borderRadius={10}
            style={{ marginBottom: 24 }}
          />

          <View className="auth-card mb-5">
            <View className="flex-row items-center gap-4 mb-4">
              <Skeleton height={64} width={64} borderRadius={32} />
              <View className="flex-1 gap-2">
                <Skeleton height={18} width="70%" borderRadius={8} />
                <Skeleton height={14} width="50%" borderRadius={8} />
              </View>
            </View>
            <Skeleton height={52} borderRadius={16} />
          </View>

          <View className="auth-card mb-5 gap-3">
            <Skeleton height={20} width={100} borderRadius={8} />
            <Skeleton height={18} borderRadius={8} />
            <Skeleton height={18} borderRadius={8} />
          </View>

          <View className="auth-card mb-5 gap-3">
            <Skeleton height={20} width={120} borderRadius={8} />
            <Skeleton height={54} borderRadius={16} />
            <View className="flex-row gap-3">
              <Skeleton height={48} width="48%" borderRadius={14} />
              <Skeleton height={48} width="48%" borderRadius={14} />
            </View>
          </View>

          <Skeleton height={54} borderRadius={16} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  const openEditModal = () => {
    setFirstName(user?.firstName ?? "");
    setLastName(user?.lastName ?? "");
    setAvatarUrl(customAvatarUrl);
    setSaveError("");
    setIsEditModalVisible(true);
  };

  const closeEditModal = () => {
    if (isSaving) return;
    setIsEditModalVisible(false);
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedAvatarUrl = avatarUrl.trim();

    setIsSaving(true);
    setSaveError("");

    try {
      await user.update({
        firstName: trimmedFirstName || null,
        lastName: trimmedLastName || null,
        unsafeMetadata: {
          ...(user.unsafeMetadata ?? {}),
          avatarUrl: trimmedAvatarUrl || null,
        },
      });

      setIsEditModalVisible(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setSaveError("Could not update profile. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: tabBarHeight + 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="text-2xl font-sans-bold text-primary mb-5">
          Settings
        </Text>

        {/* User Profile Section */}
        <View className="auth-card mb-3">
          <View className="flex-row items-center gap-4 mb-2">
            <Image
              source={
                resolvedAvatarUrl ? { uri: resolvedAvatarUrl } : images.avatar
              }
              className="size-16 rounded-full"
            />
            <View className="flex-1">
              <Text className="text-lg font-sans-bold text-primary">
                {displayName}
              </Text>
              {email && (
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  {email}
                </Text>
              )}
            </View>
          </View>

          <Pressable className="auth-secondary-button" onPress={openEditModal}>
            <Text className="auth-secondary-button-text">Edit Profile</Text>
          </Pressable>
        </View>

        {/* Account Section */}
        <View className="auth-card mb-3">
          <Text className="text-base font-sans-semibold text-primary mb-3">
            Account
          </Text>
          <View className="gap-2">
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-sm font-sans-medium text-muted-foreground">
                Account ID
              </Text>
              <Text
                className="text-sm font-sans-medium text-primary"
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {user?.id?.substring(0, 20)}...
              </Text>
            </View>
            <View className="flex-row justify-between items-center py-2">
              <Text className="text-sm font-sans-medium text-muted-foreground">
                Joined
              </Text>
              <Text className="text-sm font-sans-medium text-primary">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : "N/A"}
              </Text>
            </View>
          </View>
        </View>

        {/* Theme Section */}
        <View className="auth-card mb-3">
          <Text className="text-base font-sans-semibold text-primary mb-3">
            Appearance
          </Text>

          <View className="flex-row items-center justify-between py-2">
            <View>
              <Text className="text-sm font-sans-semibold text-primary">
                Theme Mode
              </Text>
              <Text className="text-xs font-sans-medium text-muted-foreground mt-1">
                Switch between light and dark mode
              </Text>
            </View>

            <Switch
              value={isDark}
              onValueChange={(value) =>
                setColorScheme(value ? "dark" : "light")
              }
              trackColor={{ false: "#9fa4a9", true: "#847e89" }}
              thumbColor="#c2d3cd"
            />
          </View>

          <View className="mt-3 flex-row gap-3">
            <Pressable
              className={`flex-1 items-center rounded-2xl border py-3 ${
                !isDark ? "border-accent bg-accent/15" : "border-border bg-card"
              }`}
              onPress={() => setColorScheme("light")}
            >
              <Text className="text-sm font-sans-semibold text-primary">
                Light
              </Text>
            </Pressable>

            <Pressable
              className={`flex-1 items-center rounded-2xl border py-3 ${
                isDark ? "border-accent bg-accent/15" : "border-border bg-card"
              }`}
              onPress={() => setColorScheme("dark")}
            >
              <Text className="text-sm font-sans-semibold text-primary">
                Dark
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Sign Out Button */}
        <Pressable
          className="auth-button bg-destructive"
          onPress={handleSignOut}
        >
          <Text className="auth-button-text text-background">Sign Out</Text>
        </Pressable>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent
        visible={isEditModalVisible}
        onRequestClose={closeEditModal}
      >
        <View className="flex-1 justify-end bg-primary/45">
          <Pressable className="absolute inset-0" onPress={closeEditModal} />

          <View className="rounded-t-3xl bg-background px-5 pt-5 pb-8">
            <Text className="text-2xl font-sans-bold text-primary">
              Edit Profile
            </Text>
            <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
              Update your name and avatar image URL
            </Text>

            <View className="mt-5 gap-4">
              <View className="auth-field">
                <Text className="auth-label">First Name</Text>
                <TextInput
                  className="auth-input"
                  value={firstName}
                  onChangeText={setFirstName}
                  placeholder="First name"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  autoComplete="name-given"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Last Name</Text>
                <TextInput
                  className="auth-input"
                  value={lastName}
                  onChangeText={setLastName}
                  placeholder="Last name"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  autoComplete="name-family"
                />
              </View>

              <View className="auth-field">
                <Text className="auth-label">Avatar URL</Text>
                <TextInput
                  className="auth-input"
                  value={avatarUrl}
                  onChangeText={setAvatarUrl}
                  placeholder="https://example.com/avatar.jpg"
                  placeholderTextColor="rgba(0, 0, 0, 0.4)"
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                />
                <Text className="auth-helper">
                  Leave empty to use your Clerk avatar
                </Text>
              </View>

              {saveError ? (
                <Text className="auth-error">{saveError}</Text>
              ) : null}

              <Pressable
                className={`auth-button ${isSaving && "auth-button-disabled"}`}
                onPress={handleSaveProfile}
                disabled={isSaving}
              >
                <Text className="auth-button-text">
                  {isSaving ? "Saving..." : "Save Changes"}
                </Text>
              </Pressable>

              <Pressable
                className="auth-secondary-button"
                onPress={closeEditModal}
                disabled={isSaving}
              >
                <Text className="auth-secondary-button-text">Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Settings;
