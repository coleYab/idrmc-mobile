import { useLocalSearchParams, useRouter } from "expo-router";
import { View, Text, Image, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getStatusColor } from "@/lib/mockData";
import { formatStatusLabel, formatSubscriptionDateTime } from "@/lib/utils";
import { icons } from "@/constants/icons";
import React from "react";
import { useDisasterById } from "@/hooks/queries/useDisasters";

export default function DisasterDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data: disaster, isLoading, isError } = useDisasterById(id as string);

  if (isLoading) {
      return (
          <SafeAreaView className="flex-1 bg-background justify-center items-center">
              <ActivityIndicator size="large" className="text-primary" />
          </SafeAreaView>
      )
  }

  if (isError || !disaster) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-xl font-sans-bold text-primary">Disaster Not Found</Text>
        <Pressable onPress={() => router.back()} className="mt-4 px-6 py-3 bg-accent rounded-xl">
          <Text className="text-white font-sans-bold">Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const {
    title,
    description,
    type,
    status,
    severity,
    location,
    attachments,
    totalAffectedPopulation,
    requiresUrgentMedical,
    infrastructureDamage,
    estimatedEconomicLoss,
    budgetAllocated,
    declaredBy,
    linkedIncidentIds,
    createdAt,
    activatedAt,
  } = disaster;

  const color = getStatusColor(status);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">
        {/* Header Image */}
        <View className="w-full h-72 relative">
          {attachments?.[0] ? (
             <Image source={{ uri: attachments[0] }} className="w-full h-full" resizeMode="cover" />
          ) : (
             <View className="w-full h-full bg-muted justify-center items-center">
                <Image source={icons.activity} className="w-16 h-16 opacity-50" />
             </View>
          )}

          {/* Back Button */}
          <Pressable 
            onPress={() => router.back()} 
            className="absolute top-5 left-5 w-12 h-12 bg-black/50 rounded-full justify-center items-center"
          >
            <Image source={icons.back} className="w-6 h-6 tint-white" style={{ tintColor: 'white' }} />
          </Pressable>
        </View>

        <View className="px-5 pt-6">
            <View className="flex-row items-center gap-3 mb-4 flex-wrap">
               <View style={{ backgroundColor: color }} className="px-3 py-1 rounded-full">
                 <Text className="text-white font-sans-bold text-xs">{status ? formatStatusLabel(status) : "Unknown"}</Text>
               </View>
               <View className="bg-destructive/10 px-3 py-1 rounded-full">
                 <Text className="text-destructive font-sans-bold text-xs">{severity} Severity</Text>
               </View>
               <View className="bg-muted px-3 py-1 rounded-full border border-border">
                 <Text className="text-primary font-sans-bold text-xs">{type}</Text>
               </View>
               {requiresUrgentMedical && (
                   <View className="bg-destructive px-3 py-1 rounded-full">
                       <Text className="text-white font-sans-bold text-xs">Medical Emergency</Text>
                   </View>
               )}
            </View>

            <Text className="text-3xl font-sans-extrabold text-primary mb-2 leading-tight">{title}</Text>
            
            <View className="flex-row items-center mb-6">
               <Image source={icons.activity} className="w-5 h-5 mr-2 opacity-50" style={{ tintColor: 'gray' }} />
               <Text className="text-base font-sans-medium text-muted-foreground">{location}</Text>
            </View>

            <Text className="text-base font-sans-regular text-primary mb-8 leading-relaxed opacity-80">{description}</Text>

            <View className="flex-row flex-wrap gap-3 mb-6">
               <View className="flex-1 basis-[48%] bg-card border-2 border-border rounded-xl p-4">
                  <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground mb-1">Econ. Loss (ETB)</Text>
                  <Text className="text-xl font-sans-extrabold text-primary">
                    {estimatedEconomicLoss ? Math.round(estimatedEconomicLoss / 1000000) + 'M' : 'N/A'}
                  </Text>
               </View>
               <View className="flex-1 basis-[48%] bg-card border-2 border-border rounded-xl p-4">
                  <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground mb-1">Budget (ETB)</Text>
                  <Text className="text-xl font-sans-extrabold text-primary">
                     {budgetAllocated ? Math.round(budgetAllocated / 1000000) + 'M' : 'N/A'}
                  </Text>
               </View>
            </View>

            <View className="insights-card mb-6">
                <Text className="insights-card-title mb-4">Disaster Details</Text>

                <View className="gap-3">
                   <View className="flex-row justify-between items-center py-2 border-b border-border">
                     <Text className="text-sm font-sans-medium text-muted-foreground">Affected Population</Text>
                     <Text className="text-base font-sans-bold text-primary">{totalAffectedPopulation?.toLocaleString()}</Text>
                   </View>
                   
                   <View className="flex-row justify-between items-center py-2 border-b border-border">
                     <Text className="text-sm font-sans-medium text-muted-foreground">Declared By</Text>
                     <Text className="text-base font-sans-bold text-primary">{declaredBy}</Text>
                   </View>

                   <View className="flex-row justify-between items-center py-2 border-b border-border">
                     <Text className="text-sm font-sans-medium text-muted-foreground">Declared On</Text>
                     <Text className="text-base font-sans-bold text-primary">{createdAt ? formatSubscriptionDateTime(createdAt.toString()) : "N/A"}</Text>
                   </View>
                </View>
            </View>

            {infrastructureDamage && infrastructureDamage.length > 0 && (
                <View className="insights-card">
                    <Text className="insights-card-title mb-3">Infrastructure Damage</Text>
                    <View className="tag-grid">
                      {infrastructureDamage.map((item, idx) => (
                        <View key={idx} className="tag-chip">
                           <Text className="tag-chip-text">{item}</Text>
                        </View>
                      ))}
                    </View>
                </View>
            )}

            {linkedIncidentIds && linkedIncidentIds.length > 0 && (
                <View className="insights-card mt-6">
                    <Text className="insights-card-title mb-3">Linked Incidents</Text>
                    <View className="tag-grid">
                      {linkedIncidentIds.map((item, idx) => (
                        <View key={idx} className="tag-chip bg-accent/20">
                           <Text className="tag-chip-text text-accent">{item}</Text>
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
