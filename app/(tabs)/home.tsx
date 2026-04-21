import DisasterCard from "@/components/DisasterCard";
import IncidentCard from "@/components/IncidentCard";
import LatestNotificationCard from "@/components/LatestNotificationCard";
import ListHeading from "@/components/ListHeading";
import Skeleton from "@/components/Skeleton";
import { icons } from "@/constants/icons";
import images from "@/constants/images";
import "@/global.css";
import { useDisasters } from "@/hooks/queries/useDisasters";
import { useIncidents } from "@/hooks/queries/useIncidents";
import { MOCK_NOTIFICATIONS } from "@/lib/mockData";
import { useUser } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function App() {
  const { user } = useUser();
  const router = useRouter();
  const [expandedIncidentId, setExpandedIncidentId] = useState<string | null>(
    null,
  );
  const [expandedDisasterId, setExpandedDisasterId] = useState<string | null>(
    null,
  );

  const displayName =
    user?.firstName ||
    user?.fullName ||
    user?.emailAddresses[0]?.emailAddress ||
    "User";

  const { data: incidentsData, isLoading: incidentsLoading } = useIncidents();
  const { data: disastersData, isLoading: disastersLoading } = useDisasters();

  const recentIncidents = incidentsData ? incidentsData.slice(0, 3) : [];
  const disasters = disastersData || [];

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-16"
      >
        <View className="home-header">
          <View className="home-user">
            <Image
              source={user?.imageUrl ? { uri: user.imageUrl } : images.avatar}
              className="home-avatar"
            />
            <Text className="home-user-name">{displayName}</Text>
          </View>

          <Pressable
            onPress={() => router.push("/(tabs)/add")}
            accessibilityRole="button"
            accessibilityLabel="Submit an Incident Report"
          >
            <Image source={icons.add} className="home-add-icon" />
          </Pressable>
        </View>

        <View className="home-balance-card mt-2">
          <Text className="home-balance-label">Quick Action</Text>

          <View className="home-balance-row" style={{ marginTop: 8 }}>
            <Text
              className="home-balance-amount"
              style={{ fontSize: 24, paddingBottom: 4 }}
            >
              Submit an Incident Report
            </Text>
          </View>
        </View>

        <View className="mb-5 mt-5">
          <ListHeading
            title="Notifications"
            redirect={() => {
              router.push("/(tabs)/settings");
            }}
          />

          <FlatList
            data={MOCK_NOTIFICATIONS}
            renderItem={({ item }) => <LatestNotificationCard {...item} />}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            ListEmptyComponent={
              <Text className="home-empty-state">No notifications yet.</Text>
            }
          />
        </View>

        <View className="mb-5">
          <ListHeading
            title="Incident Reports"
            redirect={() => {
              router.push("/(tabs)/incidents");
            }}
          />
          <View style={{ marginTop: 16 }}>
            {incidentsLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <View
                  key={`incident-skeleton-${index}`}
                  style={{ marginBottom: 16 }}
                >
                  <Skeleton height={138} borderRadius={20} />
                </View>
              ))
            ) : recentIncidents.length > 0 ? (
              recentIncidents.map((incident) => (
                <View key={incident.id} style={{ marginBottom: 16 }}>
                  <IncidentCard
                    onViewDetails={() => {
                      router.push(`/incidents/${incident.id}`);
                    }}
                    {...incident}
                    expanded={expandedIncidentId === incident.id}
                    onPress={() =>
                      setExpandedIncidentId((currentId) =>
                        currentId === incident.id ? null : incident.id,
                      )
                    }
                  />
                </View>
              ))
            ) : (
              <Text className="home-empty-state">
                No incidents reported yet.
              </Text>
            )}
          </View>
        </View>

        <View>
          <ListHeading
            title="Disasters"
            redirect={() => {
              router.push("/(tabs)/disasters");
            }}
          />
          <View style={{ marginTop: 16 }}>
            {disastersLoading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <View
                  key={`disaster-skeleton-${index}`}
                  style={{ marginBottom: 16 }}
                >
                  <Skeleton height={138} borderRadius={20} />
                </View>
              ))
            ) : disasters.length > 0 ? (
              disasters.map((disaster) => (
                <View key={disaster.id} style={{ marginBottom: 16 }}>
                  <DisasterCard
                    onViewDetails={() => {
                      router.push(`/disaster/${disaster.id}`);
                    }}
                    {...disaster}
                    expanded={expandedDisasterId === disaster.id}
                    onPress={() =>
                      setExpandedDisasterId((currentId) =>
                        currentId === disaster.id ? null : disaster.id,
                      )
                    }
                  />
                </View>
              ))
            ) : (
              <Text className="home-empty-state">No disasters recorded.</Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
