import { Text, TouchableOpacity, View } from "react-native";

const ListHeading = ({ title, redirect }: ListHeadingProps) => {
  return (
    <View className="list-head">
      <Text className="list-title">{title}</Text>

      <TouchableOpacity className="list-action" onPress={redirect}>
        <Text className="list-action-text">View all</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ListHeading;
