import { useCreateIncident } from "@/hooks/queries/useIncidents";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import { ActivityIndicator, Image, Modal, Pressable, ScrollView, Switch, Text, TextInput, View } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

// Using the type options defined in type.d.ts
const incidentTypes = ["Flood", "Drought", "Landslide", "Locust", "Conflict", "Fire"];
const severityLevels = ["Low", "Medium", "High", "Critical"];

export default function CreateReport() {
    const router = useRouter();
    const { mutateAsync: createIncident } = useCreateIncident();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [incidentType, setIncidentType] = useState<string | null>(null);
    const [severity, setSeverity] = useState<string | null>(null);
    const [locationInput, setLocationInput] = useState("");
    const [affectedPopulationCount, setAffectedPopulationCount] = useState("");
    const [requiresUrgentMedical, setRequiresUrgentMedical] = useState(false);

    // Updated: State for array of damages and the current text input
    const [infrastructureDamages, setInfrastructureDamages] = useState<string[]>([]);
    const [currentDamage, setCurrentDamage] = useState("");

    const [attachments, setAttachments] = useState<string[]>([]);

    // UI states
    const [isUploading, setIsUploading] = useState(false);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal state for dropdowns
    const [dropdownVisible, setDropdownVisible] = useState(false);
    const [dropdownOptions, setDropdownOptions] = useState<string[]>([]);
    const [dropdownTitle, setDropdownTitle] = useState("");
    const [onSelectDropdown, setOnSelectDropdown] = useState<(val: string) => void>(() => () => { });

    const openDropdown = (title: string, options: string[], onSelect: (val: string) => void) => {
        setDropdownTitle(title);
        setDropdownOptions(options);
        setOnSelectDropdown(() => (val: string) => {
            onSelect(val);
            setDropdownVisible(false);
        });
        setDropdownVisible(true);
    };

    const fetchLocation = async () => {
        setIsLoadingLocation(true);
        try {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                alert('Permission to access location was denied');
                setIsLoadingLocation(false);
                return;
            }
            const location = await Location.getCurrentPositionAsync({});
            setLocationInput(`${location.coords.latitude}, ${location.coords.longitude}`);
        } catch (error) {
            console.error(error);
            alert("Failed to get location");
        } finally {
            setIsLoadingLocation(false);
        }
    };

    const pickAndUploadImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (!permissionResult.granted) {
                alert("Permission to access camera roll is required!");
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                setIsUploading(true);
                const asset = result.assets[0];
                const uri = asset.uri;

                const filename = uri.split('/').pop() || 'upload.jpg';
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image/jpeg`;

                const formData = new FormData();
                formData.append('file', {
                    uri,
                    name: filename,
                    type,
                } as any);

                try {
                    const response = await fetch('https://idrmcbkd.onrender.com/api/v1/uploads/image', {
                        method: 'POST',
                        body: formData,
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    });

                    if (response.ok) {
                        const data = await response.json();
                        if (data && data.url) {
                            setAttachments(prev => [...prev, data.url]);
                        }
                    } else {
                        throw new Error(`Upload failed with status: ${response.status}`);
                    }
                } catch (uploadError) {
                    console.error("Upload error:", uploadError);
                    alert("Failed to upload image.");
                } finally {
                    setIsUploading(false);
                }
            }
        } catch (error) {
            console.error("Image picker error:", error);
            alert("An error occurred while picking the image.");
            setIsUploading(false);
        }
    };

    // Logic for adding and removing infrastructure damages
    const handleAddDamage = () => {
        if (currentDamage.trim()) {
            setInfrastructureDamages(prev => [...prev, currentDamage.trim()]);
            setCurrentDamage("");
        }
    };

    const handleRemoveDamage = (indexToRemove: number) => {
        setInfrastructureDamages(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleSubmit = async () => {
        if (!title || !description || !incidentType || !severity || !locationInput) {
            alert("Please fill out all required fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            await createIncident({
                title,
                description,
                incidentType: incidentType as any,
                severity: severity as any,
                location: locationInput,
                attachments,
                affectedPopulationCount: Number(affectedPopulationCount) || 0,
                requiresUrgentMedical,
                infrastructureDamage: infrastructureDamages,
            });
            alert("Report successfully created!");

            setTitle("");
            setDescription("");
            setIncidentType(null);
            setSeverity(null);
            setLocationInput("");
            setAffectedPopulationCount("");
            setRequiresUrgentMedical(false);
            setInfrastructureDamages([]);
            setCurrentDamage("");
            setAttachments([]);

            router.push('/');
        } catch (error) {
            console.error(error);
            alert("Failed to submit report. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView className="flex-1 bg-background">
            <ScrollView className="flex-1 px-5 pt-8 pb-10" showsVerticalScrollIndicator={false}>

                {/* Header Section */}
                <View className="mb-8">
                    <Text className="text-3xl font-sans-bold text-primary">Report an Incident</Text>
                    <Text className="text-base font-sans-medium text-muted-foreground mt-2 leading-6">
                        Please provide the details below to submit a new disaster or incident report.
                    </Text>
                </View>

                {/* Form Body */}
                <View className="auth-form mb-10 gap-y-2">

                    {/* Basic Info */}
                    <View className="auth-field">
                        <Text className="auth-label">Title *</Text>
                        <TextInput
                            className="auth-input"
                            value={title}
                            onChangeText={setTitle}
                            placeholder="e.g. Heavy Rainfall in Awash"
                        />
                    </View>

                    <View className="auth-field">
                        <Text className="auth-label">Description *</Text>
                        <TextInput
                            className="auth-input"
                            value={description}
                            onChangeText={setDescription}
                            placeholder="Provide details about the incident"
                            multiline
                            numberOfLines={4}
                            style={{ minHeight: 100, textAlignVertical: 'top' }}
                        />
                    </View>

                    {/* Grouped: Type & Severity (2 Columns) */}
                    <View className="flex-row gap-4">
                        <View className="flex-1 auth-field">
                            <Text className="auth-label">Incident Type *</Text>
                            <Pressable
                                className="dropdown-btn"
                                onPress={() => openDropdown("Select Incident Type", incidentTypes, setIncidentType)}
                            >
                                {incidentType ? (
                                    <Text className="dropdown-value" numberOfLines={1}>{incidentType}</Text>
                                ) : (
                                    <Text className="dropdown-placeholder">Type</Text>
                                )}
                                <Text className="text-primary opacity-50">▼</Text>
                            </Pressable>
                        </View>

                        <View className="flex-1 auth-field">
                            <Text className="auth-label">Severity Level *</Text>
                            <Pressable
                                className="dropdown-btn"
                                onPress={() => openDropdown("Select Severity", severityLevels, setSeverity)}
                            >
                                {severity ? (
                                    <Text className="dropdown-value" numberOfLines={1}>{severity}</Text>
                                ) : (
                                    <Text className="dropdown-placeholder">Severity</Text>
                                )}
                                <Text className="text-primary opacity-50">▼</Text>
                            </Pressable>
                        </View>
                    </View>

                    {/* Location */}
                    <View className="auth-field mt-2">
                        <Text className="auth-label">Location (Lat, Lng) *</Text>
                        <View className="flex-row items-center gap-3">
                            <TextInput
                                className="auth-input flex-1"
                                editable={false}
                                value={locationInput}
                                onChangeText={setLocationInput}
                                placeholder="e.g. 9.0300, 38.7400"
                            />
                            <Pressable
                                className="h-[52px] px-5 rounded-xl border-2 border-primary bg-muted items-center justify-center flex-row gap-2"
                                onPress={fetchLocation}
                                disabled={isLoadingLocation}
                            >
                                {isLoadingLocation ? (
                                    <ActivityIndicator color="#111" />
                                ) : (
                                    <Text className="font-sans-bold text-primary text-sm">GPS</Text>
                                )}
                            </Pressable>
                        </View>
                    </View>

                    {/* Grouped: Population & Medical (2 Columns) */}
                    <View className="flex-row gap-4 mt-2">
                        <View className="flex-1 auth-field">
                            <Text className="auth-label">Affected Population</Text>
                            <TextInput
                                className="auth-input"
                                value={affectedPopulationCount}
                                onChangeText={setAffectedPopulationCount}
                                placeholder="Estimated count"
                                keyboardType="numeric"
                            />
                        </View>

                        <View className="flex-1 auth-field">
                            <Text className="auth-label">Urgent Medical?</Text>
                            <View className="h-[52px] flex-row items-center justify-between px-2">
                                <Text className="text-base font-sans-medium text-muted-foreground">
                                    {requiresUrgentMedical ? "Yes" : "No"}
                                </Text>
                                <Switch
                                    value={requiresUrgentMedical}
                                    onValueChange={setRequiresUrgentMedical}
                                    trackColor={{ false: '#ccc', true: '#ff5a36' }}
                                />
                            </View>
                        </View>
                    </View>

                    {/* Infrastructure Damage (Styled like Attachments) */}
                    {/* Infrastructure Damage (Styled like Attachments) */}
                    <View className="auth-field mt-4 bg-muted/30 p-4 rounded-2xl border border-border/50">
                        <Text className="auth-label mb-3">Infrastructure Damage</Text>

                        {/* 1. Input & Add Button - Placed at the top so they never jump when tags are removed */}
                        <View className="flex-col gap-3">
                            <TextInput
                                className="auth-input flex-1 bg-background"
                                value={currentDamage}
                                onChangeText={setCurrentDamage}
                                placeholder="e.g. Bridge, Health Center"
                                onSubmitEditing={handleAddDamage}
                            />
                            <Pressable
                                className="px-5 py-3 bg-secondary rounded-xl border-2 border-primary/40 items-center justify-center"
                                onPress={handleAddDamage}
                            >
                                <Text className="text-primary font-sans-bold">+ Add</Text>
                            </Pressable>
                        </View>

                        <View className="flex-row flex-wrap gap-2 mt-4 pt-4 border-t border-border/50">

                            {infrastructureDamages.length ? (
                                infrastructureDamages.map((damage, idx) => (
                                    <View key={idx} className="bg-primary/10 px-3 py-2 rounded-lg flex-row items-center border border-primary/20">
                                        <Text className="text-primary font-sans-medium mr-2">{damage}</Text>
                                        {/* <Pressable
                                            onPress={() => handleRemoveDamage(idx)}
                                            className="p-1.5 ml-1 bg-primary/10 rounded-full items-center justify-center"
                                        >
                                            <Text className="text-primary/60 font-sans-bold text-sm leading-none">×</Text>
                                        </Pressable> */}
                                    </View>
                                ))
                            ) : (
                                <Text>No damages added yet.</Text>
                            )}
                        </View>
                    </View>

                    {/* Attachments */}
                    <View className="auth-field mt-2 bg-muted/30 p-4 rounded-2xl border border-border/50">
                        <Text className="auth-label mb-3">Attachments</Text>
                        {attachments.length > 0 && (
                            <ScrollView horizontal className="mb-4" showsHorizontalScrollIndicator={false}>
                                {attachments.map((uri, idx) => (
                                    <Image key={idx} source={{ uri }} className="w-24 h-24 rounded-xl mr-3 border border-black/10 bg-black/5" />
                                ))}
                            </ScrollView>
                        )}
                        <Pressable
                            className="auth-secondary-button py-4 border-dashed bg-transparent"
                            onPress={pickAndUploadImage}
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <ActivityIndicator color="#111" />
                            ) : (
                                <Text className="auth-secondary-button-text font-sans-bold">+ Upload Image</Text>
                            )}
                        </Pressable>
                    </View>

                    {/* Submit Button */}
                    <View className="mt-8 mb-16">
                        <Pressable
                            className={`auth-button ${isSubmitting ? 'auth-button-disabled' : ''}`}
                            onPress={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#111" />
                            ) : (
                                <Text className="auth-button-text">Submit Report</Text>
                            )}
                        </Pressable>
                    </View>

                </View>
            </ScrollView>

            {/* Modals remain unchanged */}
            <Modal
                transparent
                visible={dropdownVisible}
                animationType="slide"
                onRequestClose={() => setDropdownVisible(false)}
            >
                <View className="dropdown-modal-backdrop">
                    <Pressable className="absolute inset-0" onPress={() => setDropdownVisible(false)} />
                    <View className="dropdown-modal-content">
                        <Text className="text-2xl font-sans-bold text-primary mb-4">{dropdownTitle}</Text>
                        <ScrollView showsVerticalScrollIndicator={false}>
                            {dropdownOptions.map((opt, idx) => (
                                <Pressable key={idx} className="dropdown-option" onPress={() => onSelectDropdown(opt)}>
                                    <Text className="dropdown-option-text">{opt}</Text>
                                </Pressable>
                            ))}
                        </ScrollView>
                        <Pressable className="mt-6 auth-secondary-button border-transparent" onPress={() => setDropdownVisible(false)}>
                            <Text className="auth-secondary-button-text">Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            {isUploading && (
                <View className="absolute inset-0 bg-primary/60 items-center justify-center flex-1 z-50">
                    <View className="p-6 bg-background rounded-3xl items-center shadow-lg border border-border">
                        <ActivityIndicator color="#081126" size="large" />
                        <Text className="mt-4 text-base font-sans-semibold text-primary">Uploading image...</Text>
                    </View>
                </View>
            )}
        </SafeAreaView>
    );
}