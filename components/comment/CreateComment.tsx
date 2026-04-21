import * as ImagePicker from 'expo-image-picker';
import { Image as ImageIcon, Send, X } from 'lucide-react-native';
import React, { useState } from 'react';
import {
    Image,
    Keyboard,
    KeyboardAvoidingView,
    Modal,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View
} from 'react-native';

// Assuming these props are passed to your component
interface CommentModalProps {
    isCommenting: boolean;
    setIsCommenting: (val: boolean) => void;
    handleAddComment: (comment: string, attachments: ImagePicker.ImagePickerAsset[]) => void;
}

export default function CommentModal({ isCommenting, setIsCommenting, handleAddComment }: CommentModalProps) {
    const [newComment, setNewComment] = useState('');
    const [attachments, setAttachments] = useState<ImagePicker.ImagePickerAsset[]>([]);

    const pickImages = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsMultipleSelection: true, // Enables multiple uploads
            quality: 0.8,
        });

        if (!result.canceled) {
            // Console log the file names as requested
            result.assets.forEach((asset) => {
                // asset.fileName might be undefined on some platforms, fallback to extracting from URI
                const fileName = asset.fileName || asset.uri.split('/').pop();
                console.log("Selected file name:", fileName);
            });

            // Append new selections to existing ones
            setAttachments((prev) => [...prev, ...result.assets]);
        }
    };

    const removeAttachment = (indexToRemove: number) => {
        setAttachments((prev) => prev.filter((_, index) => index !== indexToRemove));
    };

    const onSubmit = () => {
        // Pass the text and local attachment objects to your parent handler
        // Your parent handler should upload these to storage and get the URLs to match `attachments: string[]`
        handleAddComment(newComment, attachments);

        // Reset state after submitting
        setNewComment('');
        setAttachments([]);
        setIsCommenting(false);
    };

    return (
        <Modal
            visible={isCommenting}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setIsCommenting(false)}
        >
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1 justify-end bg-black/40"
            >
                <TouchableWithoutFeedback onPress={() => {
                    Keyboard.dismiss();
                    setIsCommenting(false);
                }}>
                    <View className="flex-1" />
                </TouchableWithoutFeedback>

                <View className="bg-card rounded-t-3xl p-4 pb-8 shadow-lg border-t border-border/50">

                    {/* Attachments Preview Area */}
                    {attachments.length > 0 && (
                        <View className="mb-4">
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row gap-3">
                                {attachments.map((file, index) => (
                                    <View key={index} className="relative rounded-xl overflow-hidden border border-border/50">
                                        <Image source={{ uri: file.uri }} className="w-20 h-20 bg-muted" />
                                        <TouchableOpacity
                                            onPress={() => removeAttachment(index)}
                                            className="absolute top-1 right-1 bg-black/60 rounded-full p-1"
                                        >
                                            <X color="white" size={12} />
                                        </TouchableOpacity>
                                    </View>
                                ))}
                            </ScrollView>
                        </View>
                    )}

                    {/* Input Area */}
                    <View className="flex-row items-end gap-3">
                        <View className="flex-1 flex-row items-end bg-muted/30 border border-border/50 rounded-3xl px-2 py-1 shadow-sm">
                            <TouchableOpacity
                                onPress={pickImages}
                                className="w-10 h-10 rounded-full justify-center items-center mb-0.5"
                            >
                                <ImageIcon color="#888" size={22} />
                            </TouchableOpacity>

                            <TextInput
                                value={newComment}
                                onChangeText={setNewComment}
                                placeholder="Add your comment..."
                                placeholderTextColor="#888"
                                className="flex-1 font-sans-medium text-primary py-3 px-2 max-h-32 min-h-[44px]"
                                multiline
                            />
                        </View>

                        <TouchableOpacity
                            onPress={onSubmit}
                            disabled={!newComment.trim() && attachments.length === 0}
                            className={`w-12 h-12 rounded-full justify-center items-center shadow-sm mb-0.5 ${newComment.trim() || attachments.length > 0 ? 'bg-accent' : 'bg-muted'
                                }`}
                        >
                            <Send color={newComment.trim() || attachments.length > 0 ? "white" : "#888"} size={20} />
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </Modal>
    );
}