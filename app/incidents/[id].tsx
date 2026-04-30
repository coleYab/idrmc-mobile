import LocationMap from "@/components/map/LocationMap";
import { useIncidentById } from "@/hooks/queries/useIncidents";
import { getStatusColor } from "@/lib/mockData";
import { formatStatusLabel, formatSubscriptionDateTime } from "@/lib/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
    AlertTriangle,
    CheckCircle2,
    Clock,
    MapPin,
    Package,
    UserCircle,
} from "lucide-react-native";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function IncidentDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const {
    data: incident,
    isLoading,
    isError,
    refetch,
  } = useIncidentById(id as string);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  useEffect(() => {
    const attachmentList = incident?.attachments ?? [];

    if (attachmentList.length === 0) {
      setSelectedImage(null);
      return;
    }

    setSelectedImage((prev) =>
      prev && attachmentList.includes(prev) ? prev : attachmentList[0],
    );
  }, [incident?.attachments]);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="text-primary mt-4 font-sans-medium">
          Loading Incident...
        </Text>
      </View>
    );
  }

  if (isError || !incident) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-xl font-sans-bold text-primary">
          Incident Not Found
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 px-6 py-3 bg-accent rounded-xl"
        >
          <Text className="text-background font-sans-bold">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const {
    title,
    description,
    incidentType,
    status,
    severity,
    location,
    attachments,
    createdAt,
    updatedAt,
    affectedPopulationCount,
    requiresUrgentMedical,
    infrastructureDamage,
    reportedBy,
    resolvedBy,
    resolvedAt,
  } = incident;

  const color = getStatusColor(status);
  const attachmentCount = attachments?.length || 0;

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView
        bounces={true}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header Section */}
        <View className="px-5 pt-6">
          <View className="flex-row items-center mb-2 gap-2 flex-wrap">
            <View
              style={{ backgroundColor: color }}
              className="px-3 py-1 rounded-full"
            >
              <Text className="text-background font-sans-bold text-xs">
                {status ? formatStatusLabel(status) : "Unknown"}
              </Text>
            </View>
            <View className="bg-destructive/10 px-3 py-1 rounded-full">
              <Text className="text-destructive font-sans-bold text-xs">
                {severity} Severity
              </Text>
            </View>
            {requiresUrgentMedical && (
              <View className="bg-destructive px-3 py-1 rounded-full">
                <Text className="text-background font-sans-bold text-xs">
                  Medical Emergency
                </Text>
              </View>
            )}
          </View>

          <Text className="text-3xl font-sans-extrabold text-primary w-full mb-3 leading-tight">
            {title}
          </Text>

          <View className="flex-row items-center mb-4">
            <MapPin size={18} color="#847e89" />
            <Text className="text-base font-sans-medium text-muted-foreground ml-2">
              {location}
            </Text>
          </View>
        </View>

        {/* Hero Image */}
        <View className="w-full px-5 h-72 mb-4">
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-full rounded-2xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-muted justify-center items-center rounded-2xl">
              <AlertTriangle size={48} color="#9fa4a9" />
            </View>
          )}
        </View>

        {attachmentCount > 1 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="py-3 border-b border-border"
            contentContainerClassName="px-5 gap-2"
          >
            {attachments?.slice(0, 5).map((uri, idx) => (
              <Pressable
                key={idx}
                onPress={() => setSelectedImage(uri)}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${selectedImage === uri ? "border-accent" : "border-border"}`}
              >
                <Image
                  source={{ uri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </Pressable>
            ))}
            {attachmentCount > 5 && (
              <View className="w-16 h-16 rounded-lg bg-muted justify-center items-center border border-border">
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  +{attachmentCount - 5}
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        {/* Location Map */}
        <View className="px-5 pt-4">
          <LocationMap
            location={location}
            radiusMeters={3000}
            height={220}
            label="Reported Location"
          />
        </View>

        <View className="px-5 pt-2">
          {requiresUrgentMedical && (
            <View className="bg-destructive/10 px-3 py-2 rounded-lg mb-4 flex-row items-center">
              <AlertTriangle size={16} color="#56494c" />
              <Text className="text-destructive font-sans-bold text-sm ml-2">
                Medical Emergency - Urgent assistance required
              </Text>
            </View>
          )}

          <View className="flex-row items-center gap-2 mb-4 flex-wrap">
            <View className="bg-muted px-3 py-1.5 rounded-full border border-border">
              <Text className="text-primary font-sans-bold text-xs">
                {incidentType}
              </Text>
            </View>
          </View>

          <Text className="text-base font-sans-regular text-primary mb-6 leading-relaxed">
            {description}
          </Text>

          {/* Stats Cards */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-card border border-border rounded-xl p-4">
              <Text className="text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Affected Population
              </Text>
              <Text className="text-2xl font-sans-extrabold text-primary">
                {affectedPopulationCount?.toLocaleString() || "0"}
              </Text>
            </View>
            <View className="flex-1 bg-card border border-border rounded-xl p-4">
              <Text className="text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Photos
              </Text>
              <Text className="text-2xl font-sans-extrabold text-primary">
                {attachmentCount}
              </Text>
            </View>
          </View>

          <View className="bg-card rounded-2xl p-5 mb-6 border border-border">
            <Text className="text-lg font-sans-extrabold text-primary mb-4">
              Incident Details
            </Text>

            <View className="gap-4">
              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center flex-1">
                  <UserCircle size={18} color="#847e89" />
                  <View className="flex-1 flex-row justify-between">
                    <Text className="text-sm font-sans-medium text-muted-foreground ml-2">
                      Reported By
                    </Text>
                    <Text
                      className="text-base font-sans-bold text-primary"
                      numberOfLines={1}
                    >
                      {reportedBy.slice(0, 10) + "..." || "N/A"}
                    </Text>
                  </View>
                </View>
              </View>
              <View className="h-[1px] bg-border" />

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Clock size={18} color="#847e89" />
                  <Text className="text-sm font-sans-medium text-muted-foreground ml-2">
                    Reported On
                  </Text>
                </View>
                <Text className="text-base font-sans-bold text-primary">
                  {createdAt
                    ? formatSubscriptionDateTime(createdAt.toString())
                    : "N/A"}
                </Text>
              </View>
              <View className="h-[1px] bg-border" />

              <View className="flex-row justify-between items-center">
                <View className="flex-row items-center">
                  <Clock size={18} color="#847e89" />
                  <Text className="text-sm font-sans-medium text-muted-foreground ml-2">
                    Last Updated
                  </Text>
                </View>
                <Text className="text-base font-sans-bold text-primary">
                  {updatedAt
                    ? formatSubscriptionDateTime(updatedAt.toString())
                    : "N/A"}
                </Text>
              </View>

              {resolvedBy && (
                <>
                  <View className="h-[1px] bg-border" />
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <CheckCircle2 size={18} color="#847e89" />
                      <Text className="text-sm font-sans-medium text-muted-foreground ml-2">
                        Resolved By
                      </Text>
                    </View>
                    <Text className="text-base font-sans-bold text-primary">
                      {resolvedBy}
                    </Text>
                  </View>
                </>
              )}

              {resolvedAt && (
                <>
                  <View className="h-[1px] bg-border" />
                  <View className="flex-row justify-between items-center">
                    <View className="flex-row items-center">
                      <CheckCircle2 size={18} color="#847e89" />
                      <Text className="text-sm font-sans-medium text-muted-foreground ml-2">
                        Resolved On
                      </Text>
                    </View>
                    <Text className="text-base font-sans-bold text-primary">
                      {formatSubscriptionDateTime(resolvedAt.toString())}
                    </Text>
                  </View>
                </>
              )}
            </View>
          </View>

          {infrastructureDamage && infrastructureDamage.length > 0 && (
            <View className="bg-card rounded-2xl p-5 mb-6 border border-border">
              <View className="flex-row items-center mb-4">
                <Package size={20} color="#847e89" />
                <Text className="text-lg font-sans-extrabold text-primary ml-2">
                  Infrastructure Damage
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {infrastructureDamage.map((item, idx) => (
                  <View
                    key={idx}
                    className="bg-muted px-4 py-2 rounded-full border border-border"
                  >
                    <Text className="text-sm font-sans-medium text-primary">
                      {item}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
