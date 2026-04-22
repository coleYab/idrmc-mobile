import { icons } from "@/constants/icons";
import { useIncidentById } from "@/hooks/queries/useIncidents";
import { getStatusColor } from "@/lib/mockData";
import { formatStatusLabel, formatSubscriptionDateTime } from "@/lib/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function IncidentDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data: incident, isLoading, isError } = useIncidentById(id as string);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

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
          <Text className="text-white font-sans-bold">Go Back</Text>
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
        bounces={false}
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
      >
        <View className="px-5 pt-6">
          <Text className="text-3xl font-sans-extrabold text-primary w-full text-center mb-3 leading-tight">
            {title}
          </Text>
        </View>

        <View className="w-full px-5 h-80 relative">
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-full rounded-xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-muted justify-center items-center">
              <Image source={icons.activity} className="w-20 h-20 opacity-40" />
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
                className={`w-16 h-16 rounded-lg overflow-hidden border ${selectedImage === uri ? "border-accent" : "border-border"}`}
              >
                <Image
                  source={{ uri }}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </Pressable>
            ))}
            {attachmentCount > 5 && (
              <View className="w-16 h-16 rounded-lg bg-muted justify-center items-center">
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  +{attachmentCount - 5}
                </Text>
              </View>
            )}
          </ScrollView>
        )}

        <View className="px-5 pt-6">
          <View className="flex-row items-center gap-3 mb-4 flex-wrap">
            <View
              style={{ backgroundColor: color }}
              className="px-3 py-1.5 rounded-full"
            >
              <Text className="text-white font-sans-bold text-xs">
                {status ? formatStatusLabel(status) : "Unknown"}
              </Text>
            </View>
            <View className="bg-destructive/10 px-3 py-1.5 rounded-full">
              <Text className="text-destructive font-sans-bold text-xs">
                {severity} Severity
              </Text>
            </View>
            <View className="bg-muted px-3 py-1.5 rounded-full border border-border">
              <Text className="text-primary font-sans-bold text-xs">
                {incidentType}
              </Text>
            </View>
            {requiresUrgentMedical && (
              <View className="bg-destructive px-3 py-1.5 rounded-full">
                <Text className="text-white font-sans-bold text-xs">
                  Medical Emergency
                </Text>
              </View>
            )}
          </View>

          {/* <Text className="text-3xl font-sans-extrabold text-primary mb-3 leading-tight">
            {title}
          </Text> */}

          <View className="flex-row items-center mb-6">
            <Image
              source={icons.activity}
              className="w-5 h-5 mr-2 opacity-50"
              style={{ tintColor: "gray" }}
            />
            <Text className="text-base font-sans-medium text-muted-foreground">
              {location}
            </Text>
          </View>

          <Text className="text-base font-sans-regular text-primary mb-8 leading-relaxed opacity-80">
            {description}
          </Text>

          {/* Stats Cards */}
          <View className="flex-row gap-2 mb-6">
            <View className="w-25/51 bg-card border-2 border-border rounded-xl p-4">
              <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground mb-1">
                Affected Pop.
              </Text>
              <Text className="text-2xl font-sans-extrabold text-primary">
                {affectedPopulationCount?.toLocaleString() || "0"}
              </Text>
            </View>
            <View className="w-24/51 bg-card border-2 border-border rounded-xl p-4">
              <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground mb-1">
                Photos
              </Text>
              <Text className="text-2xl font-sans-extrabold text-primary">
                {attachmentCount}
              </Text>
            </View>
          </View>

          <View className="insights-card mb-6">
            <Text className="insights-card-title mb-4">Incident Details</Text>

            <View className="gap-3">
              <View className="flex-row justify-between items-center py-2 border-b border-border">
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  Reported By
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-base font-sans-bold text-primary"
                >
                  {reportedBy.slice(0, 5)} ...
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-2 border-b border-border">
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  Reported On
                </Text>
                <Text className="text-base font-sans-bold text-primary">
                  {createdAt
                    ? formatSubscriptionDateTime(createdAt.toString())
                    : "N/A"}
                </Text>
              </View>

              <View className="flex-row justify-between items-center py-2 border-b border-border">
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  Last Updated
                </Text>
                <Text className="text-base font-sans-bold text-primary">
                  {updatedAt
                    ? formatSubscriptionDateTime(updatedAt.toString())
                    : "N/A"}
                </Text>
              </View>

              {resolvedBy && (
                <View className="flex-row justify-between items-center py-2 border-b border-border">
                  <Text className="text-sm font-sans-medium text-muted-foreground">
                    Resolved By
                  </Text>
                  <Text className="text-base font-sans-bold text-primary">
                    {resolvedBy}
                  </Text>
                </View>
              )}

              {resolvedAt && (
                <View className="flex-row justify-between items-center py-2">
                  <Text className="text-sm font-sans-medium text-muted-foreground">
                    Resolved On
                  </Text>
                  <Text className="text-base font-sans-bold text-primary">
                    {formatSubscriptionDateTime(resolvedAt.toString())}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {infrastructureDamage && infrastructureDamage.length > 0 && (
            <View className="insights-card mb-6">
              <Text className="insights-card-title mb-3">
                Infrastructure Damage
              </Text>
              <View className="tag-grid">
                {infrastructureDamage.map((item, idx) => (
                  <View key={idx} className="tag-chip">
                    <Text className="tag-chip-text">{item}</Text>
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
