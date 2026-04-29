import NotificationCard from "@/components/NotificationCard";
import Skeleton from "@/components/Skeleton";
import { MOCK_NOTIFICATIONS } from "@/lib/mockData";
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

const typeOptions = [
    "ALL",
    "EMAIL",
    "SMS",
    "PUSH",
    "IN_APP",
];

const statusOptions = [
    "ALL",
    "PENDING",
    "SENT",
    "FAILED",
    "READ",
];

const sortOptions = [
    "newest",
    "oldest",
] as const;

const sortLabels: Record<string, string> = {
    newest: "Newest First",
    oldest: "Oldest First",
};

const formatLabel = (val: string) => {
    if (val === "ALL") return "All";
    return (
        val.replace(/_/g, " ").charAt(0) +
        val.replace(/_/g, " ").slice(1).toLowerCase()
    );
};

const ITEMS_PER_PAGE = 4;
const SKELETON_ROWS = 4;

const NotificationsTab = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [expandedNotificationId, setExpandedNotificationId] = useState<string | null>(null);

    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [statusFilter, setStatusFilter] = useState("ALL");
    const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]>("newest");

    const [currentPage, setCurrentPage] = useState(1);

    const notificationsData = MOCK_NOTIFICATIONS;
    const isLoading = false;

    const skeletonNotifications = Array.from(
        { length: SKELETON_ROWS },
        (_, index) => ({
            id: `notification-skeleton-${index}`,
        }),
    );

    const filteredNotifications = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();

        return notificationsData
            .filter((notification: Notificaion) => {
                const haystack = [
                    notification.title,
                    notification.message,
                    notification.type,
                    notification.status,
                ]
                    .filter(Boolean)
                    .join(" ")
                    .toLowerCase();

                if (query && !haystack.includes(query)) return false;

                if (
                    typeFilter !== "ALL" &&
                    notification.type?.toUpperCase() !== typeFilter
                )
                    return false;
                if (
                    statusFilter !== "ALL" &&
                    notification.status?.toUpperCase() !== statusFilter
                )
                    return false;

                return true;
            })
            .sort((a: Notificaion, b: Notificaion) => {
                const aDate = new Date(a.createdAt).getTime();
                const bDate = new Date(b.createdAt).getTime();
                if (sortBy === "oldest") return aDate - bDate;
                return bDate - aDate;
            });
    }, [
        searchQuery,
        typeFilter,
        statusFilter,
        sortBy,
        notificationsData,
    ]);

    const totalPages = Math.max(
        1,
        Math.ceil(filteredNotifications.length / ITEMS_PER_PAGE),
    );

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, typeFilter, statusFilter, sortBy]);

    const paginatedNotifications = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredNotifications.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredNotifications, currentPage]);

    const activeFilterCount = [
        searchQuery.trim(),
        typeFilter !== "ALL",
        statusFilter !== "ALL",
        sortBy !== "newest",
    ].filter(Boolean).length;

    const resetFilters = () => {
        setSearchQuery("");
        setTypeFilter("ALL");
        setStatusFilter("ALL");
        setSortBy("newest");
        setCurrentPage(1);
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

    const unreadCount = notificationsData.filter(
        (n: Notificaion) => n.status === "pending" || n.status === "sent"
    ).length;

    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <>
                <FlatList
                    data={isLoading ? skeletonNotifications : paginatedNotifications}
                    keyExtractor={(item: any) => item.id}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}
                    contentContainerClassName="pb-30"
                    ItemSeparatorComponent={() => <View className="h-4" />}
                    ListHeaderComponent={
                        <View>
                            <View className="home-header">
                                <View>
                                    <Text className="text-2xl font-sans-bold text-primary">
                                        Notifications
                                    </Text>
                                    <Text className="mt-1 text-sm font-sans-medium text-muted-foreground">
                                        {isLoading
                                            ? "Loading notifications..."
                                            : `${filteredNotifications.length} total result${filteredNotifications.length === 1 ? "" : "s"}`}
                                        {unreadCount > 0 && ` • ${unreadCount} unread`}
                                    </Text>
                                </View>

                                <View className="subscriptions-action-row">
                                    <Pressable
                                        className="list-action"
                                        onPress={() => setIsFilterModalVisible(true)}
                                    >
                                        <Text className="list-action-text">
                                            Filter{activeFilterCount ? ` (${activeFilterCount})` : ""}
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>

                            <View className="auth-card mt-4 mb-4">
                                <Text className="auth-label">Search Notifications</Text>
                                <TextInput
                                    className="auth-input mt-2"
                                    value={searchQuery}
                                    onChangeText={setSearchQuery}
                                    placeholder="Search by title, message, etc."
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
                                        <Text className="auth-secondary-button-text">
                                            Clear All
                                        </Text>
                                    </Pressable>
                                </View>
                            </View>
                        </View>
                    }
                    ListEmptyComponent={
                        !isLoading ? (
                            <View className="auth-card mt-5">
                                <Text className="text-base font-sans-bold text-primary">
                                    No notifications match your filters.
                                </Text>
                                <Text className="mt-2 text-sm font-sans-medium text-muted-foreground">
                                    Try clearing search or adjusting your filters.
                                </Text>
                            </View>
                        ) : null
                    }
                    renderItem={({ item }: any) =>
                        isLoading ? (
                            <Skeleton height={132} borderRadius={20} />
                        ) : (
                            <NotificationCard
                                {...item}
                                expanded={expandedNotificationId === item.id}
                                onPress={() =>
                                    setExpandedNotificationId((currentId) =>
                                        currentId === item.id ? null : item.id,
                                    )
                                }
                            />
                        )
                    }
                    ListFooterComponent={
                        !isLoading && filteredNotifications.length > 0 ? (
                            <View className="flex-row items-center justify-between mt-6 pt-4 border-t border-black/10">
                                <Pressable
                                    className={`px-4 py-2 rounded-xl border border-border ${currentPage === 1 ? "opacity-50" : "bg-white"}`}
                                    disabled={currentPage === 1}
                                    onPress={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                >
                                    <Text className="font-sans-bold text-primary">Previous</Text>
                                </Pressable>
                                <Text className="font-sans-medium text-muted-foreground">
                                    Page {currentPage} of {totalPages}
                                </Text>
                                <Pressable
                                    className={`px-4 py-2 rounded-xl border border-border ${currentPage === totalPages ? "opacity-50" : "bg-white"}`}
                                    disabled={currentPage === totalPages}
                                    onPress={() =>
                                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                                    }
                                >
                                    <Text className="font-sans-bold text-primary">Next</Text>
                                </Pressable>
                            </View>
                        ) : null
                    }
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
                                        Refine the notifications
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
                                    <Text className="auth-label">Type</Text>
                                    <ScrollView
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        className="mt-3"
                                    >
                                        <View className="flex-row gap-3 pr-2">
                                            {typeOptions.map((value) =>
                                                renderFilterChip(
                                                    value,
                                                    formatLabel(value),
                                                    typeFilter,
                                                    setTypeFilter,
                                                ),
                                            )}
                                        </View>
                                    </ScrollView>
                                </View>

                                <View className="auth-card">
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
                                                    formatLabel(value),
                                                    statusFilter,
                                                    setStatusFilter,
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
                                                    sortLabels[value],
                                                    sortBy,
                                                    (v) => setSortBy(v as any),
                                                ),
                                            )}
                                        </View>
                                    </ScrollView>
                                </View>

                                <View className="sheet-actions-row">
                                    <Pressable
                                        className="auth-button flex-1"
                                        onPress={() => setIsFilterModalVisible(false)}
                                    >
                                        <Text className="auth-button-text">Apply</Text>
                                    </Pressable>
                                </View>
                            </ScrollView>
                        </View>
                    </View>
                </Modal>
            </>
        </SafeAreaView>
    );
};

export default NotificationsTab;