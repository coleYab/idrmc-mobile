import CommentModal from "@/components/comment/CreateComment";
import { icons } from "@/constants/icons";
import { useDisasterById } from "@/hooks/queries/useDisasters";
import { getStatusColor } from "@/lib/mockData";
import { formatStatusLabel, formatSubscriptionDateTime } from "@/lib/utils";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  CheckCircle2,
  ExternalLink,
  Heart,
  MapPin,
  MessageSquareIcon,
  Package,
  X,
} from "lucide-react-native";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function DisasterDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data: disaster, isLoading, isError } = useDisasterById(id as string);

  // --- Types ---
  type DisasterComment = {
    id: string;
    disasterId: string;
    authorId: string;
    content: string;
    attachments: string[];
    createdAt: Date;
    updatedAt: Date;
  };

  type DonationCampaign = {
    campaignID: string;
    disasterID: string;
    goalAmount: number;
    currentAmount: number;
    currency: string;
    status: string;
    donationCount: number;
    description: string;
    progressPercentage: number;
    createdAt: string;
    updatedAt: string;
    closedAt: string;
  };

  // --- State ---
  const [isCommenting, setIsCommenting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const { refetch } = useDisasterById(id as string);
  const [comments, setComments] = useState<DisasterComment[]>([
    {
      id: "1",
      disasterId: id as string,
      authorId: "Admin User",
      content: "Emergency response team has been dispatched to the location.",
      attachments: [
        "https://media.istockphoto.com/id/814423752/photo/eye-of-model-with-colorful-art-make-up-close-up.jpg",
      ],
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 3600000),
    },
    {
      id: "2",
      disasterId: id as string,
      authorId: "Field Officer T.",
      content: "We need more emergency medical kits immediately.",
      attachments: [],
      createdAt: new Date(Date.now() - 1800000),
      updatedAt: new Date(Date.now() - 1800000),
    },
  ]);

  // Donation State
  const [isDonating, setIsDonating] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donationMessage, setDonationMessage] = useState("");

  const [toast, setToast] = useState<{ title: string; message: string } | null>(
    null,
  );
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-16)).current;
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // --- Mock Data ---
  const mockCampaign: DonationCampaign = {
    campaignID: "camp-12345",
    disasterID: id as string,
    goalAmount: 1000000,
    currentAmount: 450000,
    currency: "ETB",
    status: "ACTIVE", // Using ACTIVE instead of DRAFT so it makes sense in UI
    donationCount: 128,
    description:
      "Urgent relief fund to provide shelter, clean water, and medical supplies to affected families.",
    progressPercentage: 45,
    createdAt: "2026-04-21T17:37:13.982Z",
    updatedAt: "2026-04-21T17:37:13.982Z",
    closedAt: "2026-05-21T17:37:13.982Z",
  };

  // --- Handlers ---
  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const showSuccessToast = (title: string, message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }

    setToast({ title, message });
    toastOpacity.setValue(0);
    toastTranslateY.setValue(-16);

    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(toastTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        damping: 16,
        stiffness: 170,
      }),
    ]).start();

    toastTimerRef.current = setTimeout(() => {
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: -10,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          setToast(null);
        }
      });
    }, 2800);
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const handleAddComment = (
    content: string,
    imageAssets: ImagePicker.ImagePickerAsset[],
  ) => {
    if (!content.trim()) return;
    const newEntry: DisasterComment = {
      id: Date.now().toString(),
      disasterId: id as string,
      authorId: "Current User",
      content: content.trim(),
      attachments: imageAssets.map((asset) => asset.uri),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setComments((prev) => [...prev, newEntry]);
    showSuccessToast(
      "Comment posted",
      "Your update is now visible to everyone.",
    );
  };

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    const attachmentList = disaster?.attachments ?? [];

    if (attachmentList.length === 0) {
      setSelectedImage(null);
      return;
    }

    setSelectedImage((prev) =>
      prev && attachmentList.includes(prev) ? prev : attachmentList[0],
    );
  }, [disaster?.attachments]);

  const handleProcessDonation = () => {
    if (
      !donationAmount ||
      isNaN(Number(donationAmount)) ||
      Number(donationAmount) <= 0
    )
      return;

    const donationPayload = {
      amount: Number(donationAmount),
      currency: "ETB",
      donor: {
        fullName: donorName.trim() || "Anonymous",
        email: "abebe@example.com", // Mocked for payload constraints
        phoneNumber: "+251911223344", // Mocked for payload constraints
        isAnonymous: !donorName.trim(),
      },
      message: donationMessage.trim(),
    };

    console.log("Processing Donation Payload:", donationPayload);

    // Reset and close modal
    setIsDonating(false);
    setDonationAmount("");
    setDonorName("");
    setDonationMessage("");
    showSuccessToast(
      "Donation received",
      "Thank you for supporting this relief fund.",
    );
    // Here you would trigger your payment gateway or API mutation
  };

  // --- Loading/Error States ---
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" className="text-primary" />
        <Text className="text-primary mt-4 font-sans-medium">
          Loading Disaster...
        </Text>
      </View>
    );
  }

  if (isError || !disaster) {
    return (
      <SafeAreaView className="flex-1 bg-background justify-center items-center">
        <Text className="text-xl font-sans-bold text-primary">
          Disaster Not Found
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
  } = disaster;

  const color = getStatusColor(status);
  const attachmentCount = attachments?.length || 0;
  return (
    <SafeAreaView className="flex-1 bg-background">
      {toast && (
        <Animated.View
          pointerEvents="none"
          style={{
            opacity: toastOpacity,
            transform: [{ translateY: toastTranslateY }],
          }}
          className="absolute top-4 left-4 right-4 z-50"
        >
          <View className="bg-emerald-600 rounded-2xl px-4 py-3.5 shadow-xl border border-emerald-400/30 flex-row items-center">
            <View className="w-9 h-9 rounded-full bg-white/20 items-center justify-center mr-3">
              <CheckCircle2 color="white" size={18} />
            </View>
            <View className="flex-1">
              <Text className="text-white font-sans-bold text-sm">
                {toast.title}
              </Text>
              <Text className="text-white/90 font-sans-medium text-xs mt-0.5">
                {toast.message}
              </Text>
            </View>
          </View>
        </Animated.View>
      )}

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
          <View className="flex-row items-center mb-2">
            <View
              style={{ backgroundColor: color }}
              className="px-3 py-1 rounded-full"
            >
              <Text className="text-white font-sans-bold text-xs">
                {status ? formatStatusLabel(status) : "Unknown"}
              </Text>
            </View>
            <View className="bg-destructive/10 px-3 py-1 rounded-full ml-2">
              <Text className="text-destructive font-sans-bold text-xs">
                {severity} Severity
              </Text>
            </View>
          </View>

          <Text className="text-3xl font-sans-extrabold text-primary w-full mb-3 leading-tight">
            {title}
          </Text>

          <View className="flex-row items-center mb-4">
            <MapPin size={18} color="#666" />
            <Text className="text-base font-sans-medium text-muted-foreground ml-2">
              {location}
            </Text>
          </View>
        </View>

        {/* Hero Image */}
        <View className="w-full h-72 px-5 mb-4">
          {selectedImage ? (
            <Image
              source={{ uri: selectedImage }}
              className="w-full h-full rounded-2xl"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-muted justify-center items-center rounded-2xl">
              <Image source={icons.activity} className="w-20 h-20 opacity-40" />
            </View>
          )}
        </View>

        {/* Thumbnail Strip */}
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
        {/* <View className="w-full h-72 relative">
          {attachments?.[0] ? (
            <Image
              source={{ uri: attachments[0] }}
              className="w-full h-full"
              resizeMode="cover"
            />
          ) : (
            <View className="w-full h-full bg-muted justify-center items-center">
              <Image source={icons.activity} className="w-16 h-16 opacity-50" />
            </View>
          )}
        </View> */}

        <View className="px-5 pt-6">
          {requiresUrgentMedical && (
            <View className="bg-destructive/10 px-3 py-2 rounded-lg mb-4 flex-row items-center">
              <Heart size={16} color="#dc2626" fill="#dc2626" />
              <Text className="text-destructive font-sans-bold text-sm ml-2">
                Medical Emergency - Urgent assistance required
              </Text>
            </View>
          )}

          <View className="flex-row items-center gap-2 mb-4 flex-wrap">
            <View className="bg-muted px-3 py-1.5 rounded-full border border-border">
              <Text className="text-primary font-sans-bold text-xs">
                {type}
              </Text>
            </View>
          </View>

          <Text className="text-base font-sans-regular text-primary mb-6 leading-relaxed">
            {description}
          </Text>

          {/* Stats Grid */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-card border border-border rounded-xl p-4">
              <Text className="text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Economic Loss
              </Text>
              <Text className="text-xl font-sans-extrabold text-primary">
                ETB {estimatedEconomicLoss?.toLocaleString() || "0"}
              </Text>
            </View>
            <View className="flex-1 bg-card border border-border rounded-xl p-4">
              <Text className="text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Budget Allocated
              </Text>
              <Text className="text-xl font-sans-extrabold text-primary">
                ETB {budgetAllocated?.toLocaleString() || "0"}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-card border border-border rounded-xl p-4">
              <Text className="text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Affected Population
              </Text>
              <Text className="text-xl font-sans-extrabold text-primary">
                {totalAffectedPopulation?.toLocaleString() || "0"}
              </Text>
            </View>
            <View className="flex-1 bg-card border border-border rounded-xl p-4">
              <Text className="text-xs font-sans-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Declared By
              </Text>
              <Text className="text-sm font-sans-bold text-primary" numberOfLines={1}>
                {declaredBy?.slice(0, 10) || "N/A"}...
              </Text>
            </View>
          </View>

          {/* DONATION CAMPAIGN CARD */}
          <View className="bg-white rounded-2xl p-5 mb-6 shadow-sm border border-accent/20">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-xl font-sans-extrabold text-primary">
                  Relief Fund
                </Text>
                <Text className="text-sm font-sans-medium text-muted-foreground mt-1">
                  {mockCampaign.donationCount} donors • {mockCampaign.progressPercentage}% funded
                </Text>
              </View>
              <View className="w-12 h-12 bg-red-50 rounded-full items-center justify-center">
                <Heart color="#e11d48" size={24} fill="#e11d48" />
              </View>
            </View>

            <Text className="text-base font-sans-regular text-primary mb-5 leading-relaxed">
              {mockCampaign.description}
            </Text>

            {/* Progress Section */}
            <View className="mb-5">
              <View className="flex-row justify-between mb-2">
                <Text className="text-2xl font-sans-extrabold text-primary">
                  {mockCampaign.currentAmount.toLocaleString()}{" "}
                  <Text className="text-lg">{mockCampaign.currency}</Text>
                </Text>
                <Text className="text-sm font-sans-semibold text-muted-foreground self-end">
                  Goal: {mockCampaign.goalAmount.toLocaleString()}
                </Text>
              </View>

              {/* Progress Bar */}
              <View className="w-full h-4 bg-muted rounded-full overflow-hidden">
                <View
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${mockCampaign.progressPercentage}%` }}
                />
              </View>
            </View>

            <Pressable
              onPress={() => setIsDonating(true)}
              className="bg-accent py-4 rounded-xl items-center justify-center shadow-sm active:opacity-90"
            >
              <View className="flex-row items-center gap-2">
                <Heart color="white" size={20} fill="white" />
                <Text className="text-white font-sans-bold text-base">
                  Donate Now
                </Text>
              </View>
            </Pressable>
          </View>

          {/* Disaster Details */}
          <View className="bg-card rounded-2xl p-5 mb-6 border border-border">
            <Text className="text-lg font-sans-extrabold text-primary mb-4">
              Disaster Details
            </Text>
            <View className="gap-4">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  Affected Population
                </Text>
                <Text className="text-base font-sans-bold text-primary">
                  {totalAffectedPopulation?.toLocaleString() || "0"}
                </Text>
              </View>
              <View className="h-[1px] bg-border" />
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  Declared By
                </Text>
                <Text className="text-base font-sans-bold text-primary" numberOfLines={1}>
                  {declaredBy || "N/A"}
                </Text>
              </View>
              <View className="h-[1px] bg-border" />
              <View className="flex-row justify-between items-center">
                <Text className="text-sm font-sans-medium text-muted-foreground">
                  Declared On
                </Text>
                <Text className="text-base font-sans-bold text-primary">
                  {createdAt
                    ? formatSubscriptionDateTime(createdAt.toString())
                    : "N/A"}
                </Text>
              </View>
            </View>
          </View>

          {infrastructureDamage && infrastructureDamage.length > 0 && (
            <View className="bg-card rounded-2xl p-5 mb-6 border border-border">
              <View className="flex-row items-center mb-4">
                <Package size={20} color="#666" />
                <Text className="text-lg font-sans-extrabold text-primary ml-2">
                  Infrastructure Damage
                </Text>
              </View>
              <View className="flex-row flex-wrap gap-2">
                {infrastructureDamage.map((item, idx) => (
                  <View key={idx} className="bg-muted px-4 py-2 rounded-full border border-border">
                    <Text className="text-sm font-sans-medium text-primary">{item}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {linkedIncidentIds && linkedIncidentIds.length > 0 && (
            <View className="bg-card rounded-2xl p-5 mb-6 border border-border">
              <Text className="text-lg font-sans-extrabold text-primary mb-4">
                Linked Incidents
              </Text>
              <View className="gap-3">
                {linkedIncidentIds.map((item, idx) => (
                  <Pressable
                    onPress={() => router.push(`/incidents/${item}`)}
                    key={idx}
                    className="bg-accent/10 flex-row items-center justify-between py-4 px-4 rounded-xl active:opacity-80"
                  >
                    <View className="flex-row items-center flex-1">
                      <View className="w-10 h-10 bg-accent/20 rounded-full items-center justify-center mr-3">
                        <Package size={18} color="#e11d48" />
                      </View>
                      <View>
                        <Text className="font-sans-bold text-primary">
                          Incident
                        </Text>
                        <Text className="text-xs font-sans-medium text-muted-foreground">
                          ID: {item.slice(0, 8)}...
                        </Text>
                      </View>
                    </View>
                    <ExternalLink size={20} color="#666" />
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {comments.length > 0 && (
            <View className="bg-card rounded-2xl p-5 mb-6 border border-border">
              <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center">
                  <MessageSquareIcon size={20} color="#666" />
                  <Text className="text-lg font-sans-extrabold text-primary ml-2">
                    Comments ({comments.length})
                  </Text>
                </View>
                <Pressable
                  onPress={() => setIsCommenting(true)}
                  className="bg-accent px-4 py-2 rounded-lg active:opacity-80"
                >
                  <Text className="text-white font-sans-bold text-sm">
                    Add Comment
                  </Text>
                </Pressable>
              </View>

              {comments.map((comment, index) => (
                <View key={index} className="bg-background p-4 rounded-xl mb-3 border border-border">
                  <View className="flex-row items-center mb-2">
                    <View className="w-8 h-8 bg-accent/20 rounded-full items-center justify-center mr-3">
                      <Text className="text-accent font-sans-bold text-sm">
                        {comment.authorId.charAt(0)}
                      </Text>
                    </View>
                    <View className="flex-1">
                      <Text className="font-sans-bold text-primary text-sm">
                        {comment.authorId}
                      </Text>
                      <Text className="text-xs text-muted-foreground font-sans-medium">
                        {formatSubscriptionDateTime(comment.createdAt.toString())}
                      </Text>
                    </View>
                  </View>
                  <Text className="text-primary font-sans-medium leading-relaxed">
                    {comment.content}
                  </Text>
                  {comment.attachments && comment.attachments.length > 0 && (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-3">
                      {comment.attachments.slice(0, 3).map((image, idx) => (
                        <Image
                          source={{ uri: image }}
                          key={idx}
                          className="w-20 h-20 rounded-xl mr-2"
                        />
                      ))}
                    </ScrollView>
                  )}
                </View>
              ))}
            </View>
          )}

          <CommentModal
            isCommenting={isCommenting}
            setIsCommenting={setIsCommenting}
            handleAddComment={handleAddComment}
          />
        </View>
      </ScrollView>

      <Modal
        visible={isDonating}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDonating(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1 justify-end bg-black/60"
        >
          {/* Tapping the backdrop now dismisses the keyboard AND closes the modal */}
          <TouchableWithoutFeedback
            onPress={() => {
              Keyboard.dismiss();
              setIsDonating(false);
            }}
          >
            <View className="flex-1" />
          </TouchableWithoutFeedback>

          {/* Added max-h-[85%] to ensure it never covers the very top of the screen */}
          <View className="bg-card rounded-t-3xl shadow-lg border-t border-border/50 max-h-[85%] pt-4 w-full">
            {/* ScrollView wrapper for the form */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerClassName="p-6 pb-8"
              keyboardShouldPersistTaps="handled"
            >
              {/* Header */}
              <View className="flex-row justify-between items-center mb-6">
                <View>
                  <Text className="text-2xl font-sans-extrabold text-primary">
                    Support the Cause
                  </Text>
                  <Text className="text-sm font-sans-medium text-muted-foreground mt-1">
                    Every contribution makes a difference
                  </Text>
                </View>
                <Pressable
                  onPress={() => setIsDonating(false)}
                  className="bg-muted p-2 rounded-full"
                >
                  <X color="#888" size={20} />
                </Pressable>
              </View>

              {/* Quick Select Amounts */}
              <View className="flex-row gap-3 mb-4">
                {["100", "500", "1000", "5000"].map((amount) => (
                  <Pressable
                    key={amount}
                    onPress={() => setDonationAmount(amount)}
                    className={`flex-1 py-2.5 rounded-xl border items-center justify-center ${
                      donationAmount === amount
                        ? "bg-primary/10 border-primary"
                        : "bg-background border-border/60"
                    }`}
                  >
                    <Text
                      className={`font-sans-bold ${
                        donationAmount === amount
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      {amount}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Custom Price / Amount */}
              <View className="mb-4">
                <Text className="text-sm font-sans-semibold text-muted-foreground mb-2">
                  Custom Amount ({mockCampaign.currency})
                </Text>
                <View className="flex-row items-center bg-background border border-border/80 rounded-xl px-4 py-1">
                  <Text className="font-sans-bold text-lg text-muted-foreground mr-2">
                    {mockCampaign.currency}
                  </Text>
                  <TextInput
                    value={donationAmount}
                    onChangeText={setDonationAmount}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#888"
                    className="flex-1 py-3 font-sans-bold text-lg text-primary"
                  />
                </View>
              </View>

              {/* Display Name */}
              <View className="mb-4">
                <Text className="text-sm font-sans-semibold text-muted-foreground mb-2">
                  Display Name (Optional)
                </Text>
                <TextInput
                  value={donorName}
                  onChangeText={setDonorName}
                  placeholder="e.g. Abebe Kebede"
                  placeholderTextColor="#888"
                  className="bg-background border border-border/80 rounded-xl px-4 py-3.5 font-sans-medium text-primary"
                />
                <Text className="text-xs text-muted-foreground mt-1.5 font-sans-medium">
                  Leave empty to donate anonymously
                </Text>
              </View>

              {/* Support Message */}
              <View className="mb-8">
                <Text className="text-sm font-sans-semibold text-muted-foreground mb-2">
                  Message of Support
                </Text>
                <TextInput
                  value={donationMessage}
                  onChangeText={setDonationMessage}
                  placeholder="Leave a few words of encouragement..."
                  placeholderTextColor="#888"
                  multiline
                  className="bg-background border border-border/80 rounded-xl px-4 py-3.5 font-sans-medium text-primary h-24 text-top"
                  style={{ textAlignVertical: "top" }}
                />
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleProcessDonation}
                disabled={
                  !donationAmount ||
                  isNaN(Number(donationAmount)) ||
                  Number(donationAmount) <= 0
                }
                className={`py-4 rounded-xl items-center justify-center shadow-sm ${
                  !donationAmount ||
                  isNaN(Number(donationAmount)) ||
                  Number(donationAmount) <= 0
                    ? "bg-muted"
                    : "bg-accent active:opacity-80"
                }`}
              >
                <Text
                  className={`font-sans-bold text-lg ${
                    !donationAmount ||
                    isNaN(Number(donationAmount)) ||
                    Number(donationAmount) <= 0
                      ? "text-muted-foreground"
                      : "text-white"
                  }`}
                >
                  {donationAmount &&
                  !isNaN(Number(donationAmount)) &&
                  Number(donationAmount) > 0
                    ? `Donate ${Number(donationAmount).toLocaleString()} ${mockCampaign.currency}`
                    : "Donate Now"}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
