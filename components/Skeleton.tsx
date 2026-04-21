import { useEffect, useRef } from "react";
import { Animated, type StyleProp, type ViewStyle } from "react-native";

type SkeletonProps = {
  height: number;
  width?: number | string;
  borderRadius?: number;
  style?: StyleProp<ViewStyle>;
};

export default function Skeleton({
  height,
  width = "100%",
  borderRadius = 12,
  style,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.42)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 0.85,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0.42,
          duration: 700,
          useNativeDriver: true,
        }),
      ]),
    );

    pulse.start();
    return () => pulse.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[
        {
          height,
          width,
          borderRadius,
          backgroundColor: "rgba(8, 17, 38, 0.14)",
          opacity,
        },
        style,
      ]}
    />
  );
}
