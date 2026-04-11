import SubscriptionCard from "@/components/SubscriptionCard";
import { HOME_SUBSCRIPTIONS } from "@/constants/data";
import { icons } from "@/constants/icons";
import { useUser } from "@clerk/expo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import dayjs from "dayjs";
import { styled } from "nativewind";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const STORAGE_KEY_PREFIX = "recurrly:user-subscriptions";

const statusOptions = ["all", "active", "paused", "cancelled"] as const;
const billingOptions = ["all", "Monthly", "Yearly"] as const;
const sortOptions = [
  "renewalSoonest",
  "renewalLatest",
  "priceLow",
  "priceHigh",
  "name",
] as const;

type StoredSubscription = Omit<Subscription, "icon">;

const sortLabels: Record<(typeof sortOptions)[number], string> = {
  renewalSoonest: "Renewal Soonest",
  renewalLatest: "Renewal Latest",
  priceLow: "Price Low to High",
  priceHigh: "Price High to Low",
  name: "Name",
};

const formatFilterLabel = (value: string) => {
  if (value === "all") return "All";
  return value.charAt(0).toUpperCase() + value.slice(1);
};

const formatSortLabel = (value: (typeof sortOptions)[number]) =>
  sortLabels[value] ?? value;

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

const Subscriptions = () => {
  const { user, isLoaded } = useUser();
  const [searchQuery, setSearchQuery] = useState("");
  const [customSubscriptions, setCustomSubscriptions] = useState<
    Subscription[]
  >([]);
  const [expandedSubscriptionId, setExpandedSubscriptionId] = useState<
    string | null
  >(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [statusFilter, setStatusFilter] =
    useState<(typeof statusOptions)[number]>("all");
  const [billingFilter, setBillingFilter] =
    useState<(typeof billingOptions)[number]>("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] =
    useState<(typeof sortOptions)[number]>("renewalSoonest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

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
      }
    };

    loadCustomSubscriptions();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, storageKey]);

  const categories = useMemo(() => {
    const values = allSubscriptions
      .map((subscription) => subscription.category?.trim())
      .filter(Boolean) as string[];
    return [
      "all",
      ...Array.from(new Set(values)).sort((left, right) =>
        left.localeCompare(right),
      ),
    ];
  }, [allSubscriptions]);

  const filteredSubscriptions = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const parsedMinPrice = minPrice ? Number(minPrice) : null;
    const parsedMaxPrice = maxPrice ? Number(maxPrice) : null;

    return [...allSubscriptions]
      .filter((subscription) => {
        const haystack = [
          subscription.name,
          subscription.plan,
          subscription.category,
          subscription.paymentMethod,
          subscription.status,
          subscription.billing,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (query && !haystack.includes(query)) {
          return false;
        }

        if (statusFilter !== "all" && subscription.status !== statusFilter) {
          return false;
        }

        if (billingFilter !== "all" && subscription.billing !== billingFilter) {
          return false;
        }

        if (
          categoryFilter !== "all" &&
          subscription.category?.trim() !== categoryFilter
        ) {
          return false;
        }

        if (
          parsedMinPrice !== null &&
          !Number.isNaN(parsedMinPrice) &&
          subscription.price < parsedMinPrice
        ) {
          return false;
        }

        if (
          parsedMaxPrice !== null &&
          !Number.isNaN(parsedMaxPrice) &&
          subscription.price > parsedMaxPrice
        ) {
          return false;
        }

        return true;
      })
      .sort((left, right) => {
        if (sortBy === "name") {
          return left.name.localeCompare(right.name);
        }

        if (sortBy === "priceLow") {
          return left.price - right.price;
        }

        if (sortBy === "priceHigh") {
          return right.price - left.price;
        }

        const leftRenewal = left.renewalDate
          ? dayjs(left.renewalDate).valueOf()
          : Number.POSITIVE_INFINITY;
        const rightRenewal = right.renewalDate
          ? dayjs(right.renewalDate).valueOf()
          : Number.POSITIVE_INFINITY;

        if (sortBy === "renewalLatest") {
          return rightRenewal - leftRenewal;
        }

        return leftRenewal - rightRenewal;
      });
  }, [
    billingFilter,
    categoryFilter,
    maxPrice,
    minPrice,
    searchQuery,
    sortBy,
    statusFilter,
    allSubscriptions,
  ]);

  const activeFilterCount = [
    searchQuery.trim(),
    statusFilter !== "all",
    billingFilter !== "all",
    categoryFilter !== "all",
    minPrice.trim(),
    maxPrice.trim(),
    sortBy !== "renewalSoonest",
  ].filter(Boolean).length;

  const resetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setBillingFilter("all");
    setCategoryFilter("all");
    setSortBy("renewalSoonest");
    setMinPrice("");
    setMaxPrice("");
  };

  const renderFilterChip = (
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

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <FlatList
        data={filteredSubscriptions}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-30"
        ItemSeparatorComponent={() => <View className="h-4" />}
        ListHeaderComponent={
          <View>
            <View className="home-header">
              <View>
                <Text className="text-2xl font-sans-bold text-primary">
                  Subscriptions
                </Text>
                <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                  {filteredSubscriptions.length} result
                  {filteredSubscriptions.length === 1 ? "" : "s"}
                </Text>
              </View>

              <View className="subscriptions-action-row">
                <Pressable
                  className="list-action"
                  onPress={() => setIsFilterModalVisible(true)}
                  accessibilityRole="button"
                  accessibilityLabel="Open subscription filters"
                >
                  <Text className="list-action-text">
                    Filter{activeFilterCount ? ` (${activeFilterCount})` : ""}
                  </Text>
                </Pressable>
              </View>
            </View>

            <View className="auth-card mt-4">
              <Text className="auth-label">Search</Text>
              <TextInput
                className="auth-input mt-2"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search subscriptions"
                autoCapitalize="none"
              />

              <View className="subscriptions-inline-row">
                <Pressable
                  className="auth-secondary-button flex-1"
                  onPress={() => setIsFilterModalVisible(true)}
                >
                  <Text className="auth-secondary-button-text">
                    Open Filters
                  </Text>
                </Pressable>

                <Pressable
                  className="auth-secondary-button flex-1"
                  onPress={resetFilters}
                >
                  <Text className="auth-secondary-button-text">Clear</Text>
                </Pressable>
              </View>
            </View>

            <View className="my-5">
              <Text className="text-xl font-sans-bold text-primary">
                All Subscriptions
              </Text>
              <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                Tap a card to expand details.
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="auth-card mt-5">
            <Text className="text-base font-sans-bold text-primary">
              No subscriptions match your filters.
            </Text>
            <Text className="mt-2 text-sm font-sans-medium text-muted-foreground">
              Try clearing search or adjusting your filters.
            </Text>
          </View>
        }
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
      />

      <Modal
        presentationStyle="overFullScreen"
        animationType="slide"
        transparent
        visible={isFilterModalVisible}
        onRequestClose={() => setIsFilterModalVisible(false)}
      >
        <View className="sheet-backdrop">
          <Pressable
            className="absolute inset-0"
            onPress={() => setIsFilterModalVisible(false)}
          />

          <View className="sheet-panel">
            <View className="sheet-header">
              <View>
                <Text className="sheet-title">Filters</Text>
                <Text className="sheet-subtitle">
                  Filter by status, billing, category, and price.
                </Text>
              </View>

              <Pressable className="list-action" onPress={resetFilters}>
                <Text className="list-action-text">Reset</Text>
              </Pressable>
            </View>

            <ScrollView
              className="sheet-scroll"
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View className="auth-card mt-0">
                <Text className="auth-label">Status</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mt-3"
                >
                  <View className="flex-row gap-3 pr-2">
                    {statusOptions.map((value) =>
                      renderFilterChip(
                        value,
                        formatFilterLabel(value),
                        statusFilter,
                        (nextValue) =>
                          setStatusFilter(
                            nextValue as (typeof statusOptions)[number],
                          ),
                      ),
                    )}
                  </View>
                </ScrollView>
              </View>

              <View className="auth-card">
                <Text className="auth-label">Billing</Text>
                <View className="mt-3 flex-row flex-wrap gap-3">
                  {billingOptions.map((value) =>
                    renderFilterChip(value, value, billingFilter, (nextValue) =>
                      setBillingFilter(
                        nextValue as (typeof billingOptions)[number],
                      ),
                    ),
                  )}
                </View>
              </View>

              <View className="auth-card">
                <Text className="auth-label">Category</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mt-3"
                >
                  <View className="flex-row gap-3 pr-2">
                    {categories.map((value) =>
                      renderFilterChip(
                        value,
                        formatFilterLabel(value),
                        categoryFilter,
                        setCategoryFilter,
                      ),
                    )}
                  </View>
                </ScrollView>
              </View>

              <View className="auth-card">
                <Text className="auth-label">Sort By</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  className="mt-3"
                >
                  <View className="flex-row gap-3 pr-2">
                    {sortOptions.map((value) =>
                      renderFilterChip(
                        value,
                        formatSortLabel(value),
                        sortBy,
                        (nextValue) =>
                          setSortBy(nextValue as (typeof sortOptions)[number]),
                      ),
                    )}
                  </View>
                </ScrollView>
              </View>

              <View className="auth-card">
                <Text className="auth-label">Price Range</Text>
                <View className="mt-3 flex-row gap-3">
                  <TextInput
                    className="auth-input flex-1"
                    value={minPrice}
                    onChangeText={setMinPrice}
                    placeholder="Min"
                    keyboardType="decimal-pad"
                  />
                  <TextInput
                    className="auth-input flex-1"
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    placeholder="Max"
                    keyboardType="decimal-pad"
                  />
                </View>
              </View>

              <View className="sheet-actions-row">
                <Pressable
                  className="auth-button flex-1"
                  onPress={() => setIsFilterModalVisible(false)}
                >
                  <Text className="auth-button-text">Done</Text>
                </Pressable>
                <Pressable
                  className="auth-button flex-1"
                  onPress={resetFilters}
                >
                  <Text className="auth-button-text">Clear All</Text>
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Subscriptions;
