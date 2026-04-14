import type { ImageSourcePropType } from "react-native";

declare global {
    interface AppTab {
        name: string;
        title: string;
        icon: ImageSourcePropType;
    }

    interface TabIconProps {
        focused: boolean;
        icon: ImageSourcePropType;
    }

    interface Subscription {
        id: string;
        icon: ImageSourcePropType;
        name: string;
        plan?: string;
        category?: string;
        paymentMethod?: string;
        status?: string;
        startDate?: string;
        price: number;
        currency?: string;
        billing: string;
        renewalDate?: string;
        color?: string;
    }

    interface SubscriptionCardProps extends Omit<Subscription, "id"> {
        expanded: boolean;
        onPress: () => void;
        onCancelPress?: () => void;
        isCancelling?: boolean;
    }

    interface UpcomingSubscription {
        id: string;
        icon: ImageSourcePropType;
        name: string;
        price: number;
        currency?: string;
        daysLeft: number;
    }

    interface UpcomingSubscriptionCardProps
        extends Omit<UpcomingSubscription, "id"> { }

    interface ListHeadingProps {
        title: string;
    }

    enum IncidentSeverityLevel {
        LOW = 'Low',
        MEDIUM = 'Medium',
        HIGH = 'High',
        CRITICAL = 'Critical',
    }

    enum IncidentStatus {
        PENDING = 'Pending',
        VERIFIED = 'Verified',
        ACTIVE = 'Active',
        RESOLVED = 'Resolved',
        REPEATED = 'Repeated',
        FALSE_ALARM = 'False Alarm',
        REJECTED = 'Rejected',
    }

    enum IncidentType {
        FLOOD = 'Flood',
        DROUGHT = 'Drought',
        LANDSLIDE = 'Landslide',
        LOCUST = 'Locust',
        CONFLICT = 'Conflict',
        FIRE = 'Fire',
    }

    enum NotificationType {
        EMAIL = 'email',
        SMS = 'sms',
        PUSH = 'push',
        IN_APP = 'in_app',
    }

    enum NotificationStatus {
        PENDING = 'pending',
        SENT = 'sent',
        FAILED = 'failed',
        READ = 'read',
    }

    interface Notificaion {
        id: string;
        title: string;
        message: string;
        recipient: string;
        type: NotificationType;
        status: NotificationStatus;
        createdAt: Date;
        updatedAt: Date;
    }


    interface Incident {
        id: string;
        title: string;
        description: string;

        incidentType: IncidentType;
        status: IncidentStatus;
        severity: IncidentSeverityLevel;

        location: string;
        attachments: string[];

        affectedPopulationCount: number;
        requiresUrgentMedical: boolean;
        infrastructureDamage: string[];

        reportedBy: string;

        createdAt: Date;
        updatedAt: Date;

        resolvedBy?: string;
        resolvedAt?: Date;
    }


    enum DisasterSeverityLevel {
        LOW = 'Low',
        MEDIUM = 'Medium',
        HIGH = 'High',
        CRITICAL = 'Critical',
    }

    enum DisasterStatus {
        PENDING = 'Pending',
        VERIFIED = 'Verified',
        ACTIVE = 'Active',
        RESOLVED = 'Resolved',
        REPEATED = 'Repeated',
        FALSE_ALARM = 'False Alarm',
        REJECTED = 'Rejected',
    }

    enum DisasterType {
        FLOOD = 'Flood',
        DROUGHT = 'Drought',
        LANDSLIDE = 'Landslide',
        LOCUST = 'Locust',
        CONFLICT = 'Conflict',
        FIRE = 'Fire',
    }


    interface Disaster {
        id: string;
        title: string;
        description: string;

        type: DisasterType;
        status: DisasterStatus;
        severity: DisasterSeverityLevel;

        location: string;
        totalAffectedPopulation: number;
        requiresUrgentMedical: boolean;

        infrastructureDamage: string[];
        attachments: string[];

        estimatedEconomicLoss: number;
        budgetAllocated: number;

        declaredBy: string; // The Disaster Manager ID
        linkedIncidentIds: string[]; // For traceability only

        createdAt: Date;
        updatedAt: Date;

        activatedAt?: Date;
        closedAt?: Date;
    }

    interface ReportIncidentDto {
        title: string;
        description: string;
        incidentType: IncidentType; // make this thing a dropdown
        severity: IncidentSeverityLevel; // make this thing a dropdown
        location: string; // longtiude + latitiude for this request the user location and take it from the users location
        attachments: string[]; // take the image upload the image to cloudinary and append the image link
        affectedPopulationCount: number;
        requiresUrgentMedical: boolean;
        infrastructureDamage: string[]; // example: ['Bridge', 'Health center'],
    }
}

export { };
