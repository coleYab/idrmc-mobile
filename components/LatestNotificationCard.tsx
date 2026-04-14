import { icons } from '@/constants/icons';
import React from 'react';
import { Image, Text, View } from 'react-native';

const getIconForType = (type: NotificationType) => {
    switch (type) {
        case 'email' as NotificationType: return icons.gmail;
        case 'sms' as NotificationType: return icons.sms;
        default: return icons.app;
    }
};

const LatestNotificationCard = ({ title, message, type, createdAt, status }: Notificaion) => {
    return (
        <View className="upcoming-card" style={{ width: 260 }}>
            <View className="upcoming-row" style={{ alignItems: 'flex-start' }}>
                <Image source={getIconForType(type)} className="upcoming-icon" />
                <View style={{ flex: 1, marginLeft: 4 }}>
                    <Text className="upcoming-price" numberOfLines={1}>{title}</Text>
                    <Text className="upcoming-meta" numberOfLines={1}>
                        {status === 'pending' || status === 'sent' ? 'Unread • ' : ''}{new Date(createdAt).toLocaleDateString()}
                    </Text>
                </View>
            </View>

            <Text className="upcoming-name" numberOfLines={2} style={{ fontSize: 13, lineHeight: 18, color: '#666', marginTop: 12 }}>
                {message}
            </Text>
        </View>
    )
}

export default LatestNotificationCard;
