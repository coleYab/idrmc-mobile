import { MapPin } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import MapView, { Circle, Marker, PROVIDER_GOOGLE } from "react-native-maps";
import { colors } from "@/constants/theme";

interface LocationMapProps {
  /** Free-text location string, e.g. "Addis Ababa, Ethiopia" */
  location: string;
  /** Radius in meters for the impact circle (default 5000 = 5 km) */
  radiusMeters?: number;
  /** Height of the map container (default 220) */
  height?: number;
  /** Label shown above the map section */
  label?: string;
}

interface Coords {
  latitude: number;
  longitude: number;
}

/** Geocode a location string via Nominatim (OpenStreetMap) — no API key required */
async function geocode(query: string): Promise<Coords | null> {
  try {
    const encoded = encodeURIComponent(query);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encoded}&format=json&limit=1`,
      {
        headers: {
          // Nominatim requires a User-Agent header
          "User-Agent": "IDRMC-App/1.0",
        },
      },
    );
    const results = await response.json();
    if (results && results.length > 0) {
      return {
        latitude: parseFloat(results[0].lat),
        longitude: parseFloat(results[0].lon),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export default function LocationMap({
  location,
  radiusMeters = 5000,
  height = 220,
  label = "Affected Location",
}: LocationMapProps) {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!location) {
      setLoading(false);
      setError(true);
      return;
    }
    setLoading(true);
    setError(false);

    geocode(location).then((result) => {
      if (result) {
        setCoords(result);
      } else {
        setError(true);
      }
      setLoading(false);
    });
  }, [location]);

  return (
    <View style={[styles.card, { height: height + 56 }]}>
      {/* Section header */}
      <View style={styles.header}>
        <MapPin size={18} color={colors.foreground} />
        <Text style={styles.headerText}>{label}</Text>
      </View>

      <View style={[styles.mapContainer, { height }]}>
        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="small" color={colors.foreground} />
            <Text style={styles.statusText}>Locating on map…</Text>
          </View>
        ) : error || !coords ? (
          <View style={styles.center}>
            <MapPin size={32} color={colors.muted} />
            <Text style={styles.statusText}>Location unavailable</Text>
            <Text style={styles.subText}>{location}</Text>
          </View>
        ) : (
          <MapView
            provider={PROVIDER_GOOGLE}
            style={StyleSheet.absoluteFillObject}
            initialRegion={{
              latitude: coords.latitude,
              longitude: coords.longitude,
              // Keep the map tightly focused on the reported point.
              latitudeDelta: Math.max((radiusMeters / 111_320) * 1.15, 0.0025),
              longitudeDelta: Math.max(
                (radiusMeters /
                  (111_320 * Math.cos((coords.latitude * Math.PI) / 180))) *
                  1.15,
                0.0025,
              ),
            }}
            scrollEnabled={false}
            zoomEnabled={false}
            pitchEnabled={false}
            rotateEnabled={false}
          >
            {/* Red impact radius circle */}
            <Circle
              center={coords}
              radius={radiusMeters}
              fillColor="rgba(8,28,21,0.12)"
              strokeColor="rgba(8,28,21,0.6)"
              strokeWidth={2}
            />

            {/* Location pin marker */}
            <Marker
              coordinate={coords}
              title={location}
              description="Reported location"
            >
              <View style={styles.markerContainer}>
                {/* Outer pulse ring */}
                <View style={styles.markerPulse} />
                {/* Inner dot */}
                <View style={styles.markerDot}>
                  <MapPin size={14} color={colors.background} fill={colors.background} />
                </View>
              </View>
            </Marker>
          </MapView>
        )}
      </View>

      {/* Location label below map */}
      {!loading && !error && coords && (
        <View style={styles.footer}>
          <MapPin size={12} color={colors.foreground} />
          <Text style={styles.footerText} numberOfLines={1}>
            {location}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(45,106,79,0.8)",
    backgroundColor: colors.card,
    marginBottom: 24,
    shadowColor: colors.foreground,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 6,
    backgroundColor: colors.background,
  },
  headerText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#56494c",
    letterSpacing: 0.1,
  },
  mapContainer: {
    width: "100%",
    backgroundColor: colors.muted,
    overflow: "hidden",
    position: "relative",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.mutedForeground,
    marginTop: 4,
  },
  subText: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 5,
    borderTopWidth: 1,
    borderTopColor: "rgba(45,106,79,0.8)",
  },
  footerText: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontWeight: "500",
    flex: 1,
  },
  markerContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 44,
    height: 44,
  },
  markerPulse: {
    position: "absolute",
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(8,28,21,0.25)",
    borderWidth: 1.5,
    borderColor: "rgba(8,28,21,0.5)",
  },
  markerDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.foreground,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.foreground,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 6,
  },
});
