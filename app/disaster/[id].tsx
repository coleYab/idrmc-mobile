import CommentModal from "@/components/comment/CreateComment";
import { icons } from "@/constants/icons";
import { useDisasterById } from "@/hooks/queries/useDisasters";
import { getStatusColor } from "@/lib/mockData";
import { formatStatusLabel, formatSubscriptionDateTime } from "@/lib/utils";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ExternalLink, Heart, MessageSquareIcon, X } from "lucide-react-native";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View
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
  const [newComment, setNewComment] = useState("");
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
    }
  ]);

  // Donation State
  const [isDonating, setIsDonating] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donationMessage, setDonationMessage] = useState("");

  // --- Mock Data ---
  const mockCampaign: DonationCampaign = {
    campaignID: "camp-12345",
    disasterID: id as string,
    goalAmount: 1000000,
    currentAmount: 450000,
    currency: "ETB",
    status: "ACTIVE", // Using ACTIVE instead of DRAFT so it makes sense in UI
    donationCount: 128,
    description: "Urgent relief fund to provide shelter, clean water, and medical supplies to affected families.",
    progressPercentage: 45,
    createdAt: "2026-04-21T17:37:13.982Z",
    updatedAt: "2026-04-21T17:37:13.982Z",
    closedAt: "2026-05-21T17:37:13.982Z"
  };

  // --- Handlers ---
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const newEntry: DisasterComment = {
      id: Date.now().toString(),
      disasterId: id as string,
      authorId: "Current User",
      content: newComment.trim(),
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setComments((prev) => [...prev, newEntry]);
    setNewComment("");
  };

  const handleProcessDonation = () => {
    if (!donationAmount || isNaN(Number(donationAmount))) return;

    const donationPayload = {
      amount: Number(donationAmount),
      currency: "ETB",
      donor: {
        fullName: donorName.trim() || "Anonymous",
        email: "abebe@example.com", // Mocked for payload constraints
        phoneNumber: "+251911223344", // Mocked for payload constraints
        isAnonymous: !donorName.trim(),
      },
      message: donationMessage.trim()
    };

    console.log("Processing Donation Payload:", donationPayload);

    // Reset and close modal
    setIsDonating(false);
    setDonationAmount("");
    setDonorName("");
    setDonationMessage("");
    // Here you would trigger your payment gateway or API mutation
  };

  // --- Loading/Error States ---
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
  } = disaster;

  const color = getStatusColor(status);

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView bounces={false} showsVerticalScrollIndicator={false} contentContainerClassName="pb-10">

        {/* Header Title & Image */}
        <View className="px-5 pt-6">
          <Text className="text-3xl font-sans-extrabold text-primary mb-2 leading-tight">{title}</Text>
        </View>
        <View className="w-full h-72 relative">
          {attachments?.[0] ? (
            <Image source={{ uri: attachments[0] }} className="w-full h-full" resizeMode="cover" />
          ) : (
            <View className="w-full h-full bg-muted justify-center items-center">
              <Image source={icons.activity} className="w-16 h-16 opacity-50" />
            </View>
          )}
        </View>

        <View className="px-5 pt-6">
          {/* Tags */}
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

          <View className="flex-row items-center mb-6">
            <Image source={icons.activity} className="w-5 h-5 mr-2 opacity-50" style={{ tintColor: 'gray' }} />
            <Text className="text-base font-sans-medium text-muted-foreground">{location}</Text>
          </View>

          <Text className="text-base font-sans-regular text-primary mb-8 leading-relaxed opacity-80">{description}</Text>

          {/* Economy & Budget */}
          <View className="flex-row flex-wrap gap-3 mb-6">
            <View className="flex-1 basis-[48%] bg-card border-2 border-border rounded-xl p-4">
              <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground mb-1">Econ. Loss (ETB)</Text>
              <Text className="text-xl font-sans-extrabold text-primary">{estimatedEconomicLoss}</Text>
            </View>
            <View className="flex-1 basis-[48%] bg-card border-2 border-border rounded-xl p-4">
              <Text className="text-xs font-sans-semibold uppercase tracking-[1px] text-muted-foreground mb-1">Budget (ETB)</Text>
              <Text className="text-xl font-sans-extrabold text-primary">{budgetAllocated}</Text>
            </View>
          </View>

          {/* DONATION CAMPAIGN CARD */}
          <View className="insights-card mb-6 border border-accent/20 bg-accent/5">
            <View className="flex-row justify-between items-center my-3">
              <Text className="text-lg font-sans-extrabold text-primary">Relief Fund</Text>
              <Heart color="#e11d48" size={20} fill="#e11d48" />
            </View>

            <Text className="text-md font-sans-medium text-primary mb-5 opacity-80 leading-5">
              {mockCampaign.description}
            </Text>

            <View className="mb-5">
              <View className="flex-row justify-between mb-1.5 items-end">
                <Text className="text-primary font-sans-extrabold text-lg">
                  {mockCampaign.currentAmount.toLocaleString()} {mockCampaign.currency}
                </Text>
                <Text className="text-xs font-sans-semibold text-muted-foreground">
                  of {mockCampaign.goalAmount.toLocaleString()} {mockCampaign.currency} goal
                </Text>
              </View>

              {/* Progress Bar */}
              <View className="w-full h-3 bg-muted rounded-full overflow-hidden">
                <View
                  className="h-full bg-accent"
                  style={{ width: `${mockCampaign.progressPercentage}%` }}
                />
              </View>

              <Text className="text-xs text-muted-foreground mt-2 font-sans-medium">
                {mockCampaign.donationCount} people have donated
              </Text>
            </View>

            <Pressable
              onPress={() => setIsDonating(true)}
              className="bg-accent py-4 rounded-xl items-center justify-center shadow-sm flex-row gap-2"
            >
              <Heart color="white" size={18} />
              <Text className="text-white font-sans-bold text-base">Donate Now</Text>
            </Pressable>
          </View>

          {/* Disaster Details */}
          <View className="insights-card mb-6">
            <Text className="insights-card-title mb-4">Disaster Details</Text>
            <View className="gap-3">
              <View className="flex-row justify-between items-center py-2 border-b border-border">
                <Text className="text-sm font-sans-medium text-muted-foreground">Affected Population</Text>
                <Text className="text-base font-sans-bold text-primary">{totalAffectedPopulation?.toLocaleString()}</Text>
              </View>
              <View className="flex-row justify-between items-center py-2 border-b border-border">
                <Text className="text-sm font-sans-medium text-muted-foreground">Declared By</Text>
                <Text className="text-base font-sans-bold text-primary">{declaredBy.slice(0, 5)} ...</Text>
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
                  <Pressable onPress={() => router.push(`/incidents/${item}`)} key={idx} className="bg-accent/20 flex-row items-center justify-between w-full gap-2 py-3 px-3 rounded-xl">
                    <Text className="tag-chip-text text-accent">Incident - {item.slice(0, 6)} ...</Text>
                    <ExternalLink size={20} />
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {comments.length > 0 && (
            <View className="insights-card mt-6">
              <Text className="insights-card-title mb-3">Comments</Text>

              <Pressable onPress={() => setIsCommenting(true)} className="bg-accent p-4 rounded-xl mb-4 flex-row items-center justify-between">
                <Text className="text-white font-sans-bold">Write a Comment</Text>
                <MessageSquareIcon color="white" />
              </Pressable>

              {comments.map((comment, index) => (
                <View key={index} className="bg-accent/10 p-4 rounded-xl mb-4">
                  <Text numberOfLines={3} className="text-primary font-sans-medium">{comment.content}</Text>
                  {comment.attachments && comment.attachments.length > 0 && (
                    <View className="flex-row gap-2 mt-3">
                      {comment.attachments.slice(0, 3).map((image, idx) => (
                        <Image source={{ uri: image }} key={idx} className="w-16 h-16 rounded-xl" />
                      ))}
                    </View>
                  )}
                  <Text className="mt-3 text-xs text-muted-foreground font-sans-semibold">By {comment.authorId}</Text>
                </View>
              ))}
            </View>
          )}

          <CommentModal isCommenting={isCommenting} setIsCommenting={setIsCommenting} handleAddComment={handleAddComment} />

        </View>
      </ScrollView>


      <Modal
        visible={isDonating}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsDonating(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
                  <Text className="text-2xl font-sans-extrabold text-primary">Support the Cause</Text>
                  <Text className="text-sm font-sans-medium text-muted-foreground mt-1">Every contribution makes a difference</Text>
                </View>
                <Pressable onPress={() => setIsDonating(false)} className="bg-muted p-2 rounded-full">
                  <X color="#888" size={20} />
                </Pressable>
              </View>

              {/* Quick Select Amounts */}
              <View className="flex-row gap-3 mb-4">
                {["100", "500", "1000", "5000"].map((amount) => (
                  <Pressable
                    key={amount}
                    onPress={() => setDonationAmount(amount)}
                    className={`flex-1 py-2.5 rounded-xl border items-center justify-center ${donationAmount === amount
                      ? 'bg-primary/10 border-primary'
                      : 'bg-background border-border/60'
                      }`}
                  >
                    <Text className={`font-sans-bold ${donationAmount === amount ? 'text-primary' : 'text-muted-foreground'
                      }`}>
                      {amount}
                    </Text>
                  </Pressable>
                ))}
              </View>

              {/* Custom Price / Amount */}
              <View className="mb-4">
                <Text className="text-sm font-sans-semibold text-muted-foreground mb-2">Custom Amount ({mockCampaign.currency})</Text>
                <View className="flex-row items-center bg-background border border-border/80 rounded-xl px-4 py-1">
                  <Text className="font-sans-bold text-lg text-muted-foreground mr-2">{mockCampaign.currency}</Text>
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
                <Text className="text-sm font-sans-semibold text-muted-foreground mb-2">Display Name (Optional)</Text>
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
                <Text className="text-sm font-sans-semibold text-muted-foreground mb-2">Message of Support</Text>
                <TextInput
                  value={donationMessage}
                  onChangeText={setDonationMessage}
                  placeholder="Leave a few words of encouragement..."
                  placeholderTextColor="#888"
                  multiline
                  className="bg-background border border-border/80 rounded-xl px-4 py-3.5 font-sans-medium text-primary h-24 text-top"
                  style={{ textAlignVertical: 'top' }}
                />
              </View>

              {/* Submit Button */}
              <Pressable
                onPress={handleProcessDonation}
                disabled={!donationAmount || isNaN(Number(donationAmount)) || Number(donationAmount) <= 0}
                className={`py-4 rounded-xl items-center justify-center shadow-sm ${!donationAmount || isNaN(Number(donationAmount)) || Number(donationAmount) <= 0
                  ? 'bg-muted'
                  : 'bg-accent active:opacity-80'
                  }`}
              >
                <Text className={`font-sans-bold text-lg ${!donationAmount || isNaN(Number(donationAmount)) || Number(donationAmount) <= 0
                  ? 'text-muted-foreground'
                  : 'text-white'
                  }`}>
                  {donationAmount && !isNaN(Number(donationAmount)) && Number(donationAmount) > 0
                    ? `Donate ${Number(donationAmount).toLocaleString()} ${mockCampaign.currency}`
                    : 'Donate Now'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}