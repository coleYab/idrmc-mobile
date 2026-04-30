import { icons } from "@/constants/icons";
import { getStatusColor } from "@/lib/mockData";
import { formatStatusLabel, formatSubscriptionDateTime } from "@/lib/utils";
import clsx from "clsx";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

interface IncidentCardProps extends Incident {
  expanded?: boolean;
  onPress?: () => void;
  onViewDetails: () => void;
}

const IncidentCard = ({
  title,
  description,
  incidentType,
  status,
  severity,
  location,
  attachments,
  createdAt,
  affectedPopulationCount,
  requiresUrgentMedical,
  infrastructureDamage,
  reportedBy,
  onViewDetails,
  expanded,
  onPress,
}: IncidentCardProps) => {
  const color = getStatusColor(status);
  const imageSource = attachments?.[0]
    ? { uri: attachments[0] }
    : icons.activity;

  return (
    <Pressable
      onPress={onPress}
      className={clsx("sub-card", expanded ? "sub-card-expanded" : "bg-card")}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image source={icons.activity} className="sub-icon" />
          <View className="sub-copy">
            <Text numberOfLines={1} className="sub-title">
              {title}
            </Text>
            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {incidentType?.trim() || location?.trim()}
            </Text>
          </View>
        </View>
      </View>

      {expanded && (
        <View className="sub-body">
          <View className="sub-details">
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Severity:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {severity?.trim() ?? "Not provided"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Incident Type:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {incidentType ?? "Not provided"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Affcted Population:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {affectedPopulationCount}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Reported At:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {createdAt
                    ? formatSubscriptionDateTime(createdAt.toString())
                    : "Not provided"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Status:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {status ? formatStatusLabel(status) : "Not provided"}
                </Text>
              </View>
            </View>
          </View>

          <Pressable
            onPress={onViewDetails}
            className="mt-5 bg-accent py-3 rounded-xl shadow-sm"
          >
            <Text className="text-background text-center font-semibold text-base">
              View Details
            </Text>
          </Pressable>
        </View>
      )}
    </Pressable>
  );
};

export default IncidentCard;
