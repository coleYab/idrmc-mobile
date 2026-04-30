import { icons } from "@/constants/icons";
import { formatStatusLabel, formatSubscriptionDateTime } from "@/lib/utils";
import clsx from "clsx";
import React from "react";
import { Image, Pressable, Text, View } from "react-native";

interface NotificationCardProps extends Notificaion {
  expanded?: boolean;
  onPress?: () => void;
}

const getIconForType = (type: NotificationType) => {
  switch (type) {
    case "email":
      return icons.gmail;
    case "sms":
      return icons.sms;
    default:
      return icons.app;
  }
};

const getStatusColor = (status: NotificationStatus): string => {
  switch (status) {
    case "pending":
      return "#9fa4a9";
    case "sent":
      return "#afbfc0";
    case "failed":
      return "#56494c";
    case "read":
      return "#c2d3cd";
    default:
      return "#847e89";
  }
};

const NotificationCard = ({
  title,
  message,
  type,
  status,
  createdAt,
  updatedAt,
  expanded,
  onPress,
}: NotificationCardProps) => {
  const color = getStatusColor(status);
  const isUnread = status === "pending" || status === "sent";

  return (
    <Pressable
      onPress={onPress}
      className={clsx("sub-card", expanded ? "sub-card-expanded" : "bg-card")}
      style={!expanded && color ? { backgroundColor: color } : undefined}
    >
      <View className="sub-head">
        <View className="sub-main">
          <Image source={getIconForType(type)} className="sub-icon" />
          <View className="sub-copy">
            <View className="flex-row items-center gap-2">
              <Text numberOfLines={1} className="sub-title flex-1">
                {title}
              </Text>
              {isUnread && !expanded && (
                <View className="w-2 h-2 rounded-full bg-background" />
              )}
            </View>
            <Text numberOfLines={1} ellipsizeMode="tail" className="sub-meta">
              {type?.toUpperCase()} •{" "}
              {createdAt
                ? formatSubscriptionDateTime(createdAt.toString())
                : "Not provided"}
            </Text>
          </View>
        </View>
      </View>

      {expanded && (
        <View className="sub-body">
          <View className="sub-details">
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Message:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={0}
                  ellipsizeMode="tail"
                >
                  {message ?? "Not provided"}
                </Text>
              </View>
            </View>
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Type:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {type ? formatStatusLabel(type) : "Not provided"}
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
            <View className="sub-row">
              <View className="sub-row-copy">
                <Text className="sub-label">Created:</Text>
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
                <Text className="sub-label">Updated:</Text>
                <Text
                  className="sub-value"
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {updatedAt
                    ? formatSubscriptionDateTime(updatedAt.toString())
                    : "Not provided"}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </Pressable>
  );
};

export default NotificationCard;
