import ListHeading from "@/components/ListHeading";
import SubscriptionCard from "@/components/SubscriptionCard";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import {
    HOME_BALANCE,
    HOME_SUBSCRIPTIONS,
    UPCOMING_SUBSCRIPTIONS,
} from "@/constants/data";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { formatCurrency } from "@/lib/utils";
import { useUser } from "@clerk/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useEffect, useMemo, useState } from "react";
import {
    FlatList,
    Image,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const STORAGE_KEY_PREFIX = "recurrly:user-subscriptions";
const createStatusOptions = ["active", "paused", "cancelled"] as const;
const createBillingOptions = ["Monthly", "Yearly"] as const;

type StoredSubscription = Omit<Subscription, "icon">;

const formatFilterLabel = (value: string) => {
  if (value === "all") return "All";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const isValidStoredSubscription = (
  subscription: Partial<StoredSubscription>,
): subscription is StoredSubscription => {
  return Boolean(
    subscription.id &&
    subscription.name &&
    typeof subscription.price === "number" &&
    subscription.billing,
  );
};

export default function App() {
  const { user, isLoaded } = useUser();
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [customSubscriptions, setCustomSubscriptions] = useState<
    Subscription[]
  >([]);
  const [isStorageReady, setIsStorageReady] = useState(false);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPlan, setNewPlan] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPaymentMethod, setNewPaymentMethod] = useState("");
  const [newBilling, setNewBilling] =
    useState<(typeof createBillingOptions)[number]>("Monthly");
  const [newStatus, setNewStatus] =
    useState<(typeof createStatusOptions)[number]>("active");
  const [newPrice, setNewPrice] = useState("");
  const [newRenewalDate, setNewRenewalDate] = useState("");
  const [createError, setCreateError] = useState("");

  const storageKey = `${STORAGE_KEY_PREFIX}:${user?.id ?? "guest"}`;

  const allSubscriptions = useMemo(
    () => [...customSubscriptions, ...HOME_SUBSCRIPTIONS],
    [customSubscriptions],
  );

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    let isMounted = true;

    const loadCustomSubscriptions = async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);

        if (!raw) {
          if (isMounted) {
            setCustomSubscriptions([]);
          }
          return;
        }

        const parsed = JSON.parse(raw) as Partial<StoredSubscription>[];
        const hydrated = parsed
          .filter(isValidStoredSubscription)
          .map((subscription) => ({
            ...subscription,
            icon: icons.plus,
          }));

        if (isMounted) {
          setCustomSubscriptions(hydrated);
        }
      } catch (error) {
        console.error("Failed to load subscriptions:", error);
        if (isMounted) {
          setCustomSubscriptions([]);
        }
      } finally {
        if (isMounted) {
          setIsStorageReady(true);
        }
      }
    };

    setIsStorageReady(false);
    loadCustomSubscriptions();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, storageKey]);

  useEffect(() => {
    if (!isStorageReady) {
      return;
    }

    const persistCustomSubscriptions = async () => {
      try {
        const serializedSubscriptions: StoredSubscription[] =
          customSubscriptions.map(
            ({ icon: _icon, ...subscription }) => subscription,
          );
        await AsyncStorage.setItem(
          storageKey,
          JSON.stringify(serializedSubscriptions),
        );
      } catch (error) {
        console.error("Failed to save subscriptions:", error);
      }
    };

    persistCustomSubscriptions();
  }, [customSubscriptions, isStorageReady, storageKey]);

  const resetCreateForm = () => {
    setNewName("");
    setNewPlan("");
    setNewCategory("");
    setNewPaymentMethod("");
    setNewBilling("Monthly");
    setNewStatus("active");
    setNewPrice("");
    setNewRenewalDate("");
    setCreateError("");
  };

  const closeCreateModal = () => {
    setIsCreateModalVisible(false);
    setCreateError("");
  };

  const renderChip = (
    value: string,
    label: string,
    selectedValue: string,
    onPress: (value: string) => void,
  ) => {
    const isSelected = selectedValue === value;

    return (
      <Pressable
        key={value}
        className={`subscriptions-chip ${isSelected ? "subscriptions-chip-active" : ""}`}
        onPress={() => onPress(value)}
      >
        <Text className="subscriptions-chip-text">{label}</Text>
      </Pressable>
    );
  };

  const handleCreateSubscription = () => {
    const trimmedName = newName.trim();
    const parsedPrice = Number(newPrice);
    const trimmedRenewalDate = newRenewalDate.trim();

    if (!trimmedName) {
      setCreateError("Subscription name is required.");
      return;
    }

    if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      setCreateError("Price must be a valid number greater than zero.");
      return;
    }

    if (trimmedRenewalDate && !dayjs(trimmedRenewalDate).isValid()) {
      setCreateError("Renewal date must be a valid date (YYYY-MM-DD). ");
      return;
    }

    const createdAt = dayjs().toISOString();
    const idBase = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const createdSubscription: Subscription = {
      id: `${idBase || "subscription"}-${Date.now()}`,
      icon: icons.plus,
      name: trimmedName,
      plan: newPlan.trim() || undefined,
      category: newCategory.trim() || undefined,
      paymentMethod: newPaymentMethod.trim() || undefined,
      status: newStatus,
      startDate: createdAt,
      price: parsedPrice,
      currency: "USD",
      billing: newBilling,
      renewalDate: trimmedRenewalDate
        ? dayjs(trimmedRenewalDate).toISOString()
        : undefined,
    };

    setCustomSubscriptions((currentSubscriptions) => [
      createdSubscription,
      ...currentSubscriptions,
    ]);
    setExpandedSubscriptionId(createdSubscription.id);
    closeCreateModal();
    resetCreateForm();
  };

  const displayName =
    user?.firstName ||
    user?.fullName ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        ListHeaderComponent={() => (
          <>
            <View className="home-header">
              <View className="home-user">
                <Image
                  source={
                    user?.imageUrl ? { uri: user.imageUrl } : images.avatar
                  }
                  className="home-avatar"
                />
                <Text className="home-user-name">{displayName}</Text>
              </View>

              <Pressable
                onPress={() => setIsCreateModalVisible(true)}
                accessibilityRole="button"
                accessibilityLabel="Create a new subscription"
              >
                <Image source={icons.add} className="home-add-icon" />
              </Pressable>
            </View>

            <View className="home-balance-card">
              <Text className="home-balance-label">Balance</Text>

              <View className="home-balance-row">
                <Text className="home-balance-amount">
                  {formatCurrency(HOME_BALANCE.amount)}
                </Text>
                <Text className="home-balance-date">
                  {dayjs(HOME_BALANCE.nextRenewalDate).format("MM/DD")}
                </Text>
              </View>
            </View>

            <View className="mb-5">
              <ListHeading title="Upcoming" />

              <FlatList
                data={UPCOMING_SUBSCRIPTIONS}
                renderItem={({ item }) => (
                  <UpcomingSubscriptionCard {...item} />
                )}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                ListEmptyComponent={
                  <Text className="home-empty-state">
                    No upcoming renewals yet.
                  </Text>
                }
              />
            </View>

            <ListHeading title="All Subscriptions" />
          </>
        )}
        data={allSubscriptions}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <SubscriptionCard
            {...item}
            expanded={expandedSubscriptionId === item.id}
            onPress={() =>
              setExpandedSubscriptionId((currentId) =>
                currentId === item.id ? null : item.id,
              )
            }
          />
        )}
        extraData={expandedSubscriptionId}
        ItemSeparatorComponent={() => <View className="h-4" />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="home-empty-state">No subscriptions yet.</Text>
        }
        contentContainerClassName="pb-30"
      />

      <Modal
        presentationStyle="overFullScreen"
        animationType="slide"
        transparent
        visible={isCreateModalVisible}
        onRequestClose={closeCreateModal}
      >
        <View className="sheet-backdrop">
          <Pressable className="absolute inset-0" onPress={closeCreateModal} />

          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            className="sheet-panel"
          >
            <View className="sheet-header">
              <View>
                <Text className="sheet-title">Create Subscription</Text>
                <Text className="sheet-subtitle">
                  Add a subscription and keep it saved on your device.
                </Text>
              </View>

              {/* <Pressable className="list-action" onPress={resetCreateForm}>
                <Text className="list-action-text">Reset</Text>
              </Pressable> */}
            </View>

            <ScrollView
              className="sheet-scroll"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="auth-card mt-0">
                <View className="auth-form">
                  <View className="auth-field">
                    <Text className="auth-label">Subscription Name *</Text>
                    <TextInput
                      className="auth-input"
                      value={newName}
                      onChangeText={setNewName}
                      placeholder="e.g. Figma Pro"
                      autoCapitalize="words"
                    />
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Plan</Text>
                    <TextInput
                      className="auth-input"
                      value={newPlan}
                      onChangeText={setNewPlan}
                      placeholder="e.g. Teams Plan"
                    />
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Category</Text>
                    <TextInput
                      className="auth-input"
                      value={newCategory}
                      onChangeText={setNewCategory}
                      placeholder="e.g. Design"
                    />
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Payment Method</Text>
                    <TextInput
                      className="auth-input"
                      value={newPaymentMethod}
                      onChangeText={setNewPaymentMethod}
                      placeholder="e.g. Visa ending in 1234"
                    />
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Price (USD) *</Text>
                    <TextInput
                      className="auth-input"
                      value={newPrice}
                      onChangeText={setNewPrice}
                      placeholder="e.g. 19.99"
                      keyboardType="decimal-pad"
                    />
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Billing</Text>
                    <View className="flex-row gap-3">
                      {createBillingOptions.map((value) =>
                        renderChip(value, value, newBilling, (nextValue) =>
                          setNewBilling(
                            nextValue as (typeof createBillingOptions)[number],
                          ),
                        ),
                      )}
                    </View>
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">Status</Text>
                    <View className="flex-row flex-wrap gap-3">
                      {createStatusOptions.map((value) =>
                        renderChip(
                          value,
                          formatFilterLabel(value),
                          newStatus,
                          (nextValue) =>
                            setNewStatus(
                              nextValue as (typeof createStatusOptions)[number],
                            ),
                        ),
                      )}
                    </View>
                  </View>

                  <View className="auth-field">
                    <Text className="auth-label">
                      Renewal Date (YYYY-MM-DD)
                    </Text>
                    <TextInput
                      className="auth-input"
                      value={newRenewalDate}
                      onChangeText={setNewRenewalDate}
                      placeholder="Optional"
                      autoCapitalize="none"
                    />
                  </View>

                  {createError ? (
                    <View className="subscriptions-error-box">
                      <Text className="subscriptions-error-text">
                        {createError}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </View>

              <View className="sheet-actions-row">
                <Pressable
                  className="auth-secondary-button flex-1"
                  onPress={closeCreateModal}
                >
                  <Text className="auth-secondary-button-text">Cancel</Text>
                </Pressable>
                <Pressable
                  className="auth-button flex-1"
                  onPress={handleCreateSubscription}
                >
                  <Text className="auth-button-text">Create</Text>
                </Pressable>
              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
