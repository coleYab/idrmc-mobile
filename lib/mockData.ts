export const MOCK_INCIDENTS: Incident[] = [
  {
    id: "inc-001",
    title: "Heavy Rainfall in Awash",
    description:
      "Continuous heavy rainfall causing water levels to rise rapidly.",
    incidentType: "FLOOD",
    status: "ACTIVE",
    severity: "HIGH",
    location: "Awash Basin",
    attachments: [
      "https://images.unsplash.com/photo-1428592953211-077101b2021b?auto=format&fit=crop&q=80&w=400",
    ],
    affectedPopulationCount: 1500,
    requiresUrgentMedical: true,
    infrastructureDamage: ["Roads", "Bridges"],
    reportedBy: "user_awash_123",
    createdAt: new Date("2026-04-12T08:00:00Z"),
    updatedAt: new Date("2026-04-12T10:00:00Z"),
  },
  {
    id: "inc-002",
    title: "Localized Locust Swarm",
    description: "Small swarm detected resting in crops near Dire Dawa.",
    incidentType: "LOCUST",
    status: "PENDING",
    severity: "MEDIUM",
    location: "Dire Dawa outskirts",
    attachments: [
      "https://images.unsplash.com/photo-1542614761-124b81bcafab?auto=format&fit=crop&q=80&w=400",
    ],
    affectedPopulationCount: 0,
    requiresUrgentMedical: false,
    infrastructureDamage: [],
    reportedBy: "farmer_dd_01",
    createdAt: new Date("2026-04-13T06:30:00Z"),
    updatedAt: new Date("2026-04-13T06:30:00Z"),
  },
  {
    id: "inc-003",
    title: "Forest Fire - Bale Mountains",
    description: "Smoke spotted deep within the national park.",
    incidentType: "FIRE",
    status: "VERIFIED",
    severity: "CRITICAL",
    location: "Bale Mountains National Park",
    attachments: [
      "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?auto=format&fit=crop&q=80&w=400",
    ],
    affectedPopulationCount: 200,
    requiresUrgentMedical: false,
    infrastructureDamage: ["Park Rangers Outpost"],
    reportedBy: "ranger_hq",
    createdAt: new Date("2026-04-11T14:20:00Z"),
    updatedAt: new Date("2026-04-12T09:15:00Z"),
  },
  {
    id: "inc-004",
    title: "Suspicious Soil Movement",
    description: "Minor landslide blocking local unpaved road.",
    incidentType: "LANDSLIDE",
    status: "RESOLVED",
    severity: "LOW",
    location: "Dessie Zuria",
    attachments: [
      "https://images.unsplash.com/photo-1601007823528-6612e6bf5632?auto=format&fit=crop&q=80&w=400",
    ],
    affectedPopulationCount: 20,
    requiresUrgentMedical: false,
    infrastructureDamage: ["Local unpaved road"],
    reportedBy: "community_leader_04",
    createdAt: new Date("2026-04-05T09:00:00Z"),
    updatedAt: new Date("2026-04-06T11:00:00Z"),
    resolvedBy: "local_gov_ds",
    resolvedAt: new Date("2026-04-06T11:00:00Z"),
  },
  {
    id: "inc-005",
    title: "Prolonged Dry Spells",
    description: "Wells drying up completely in the pastoral region.",
    incidentType: "DROUGHT",
    status: "ACTIVE",
    severity: "HIGH",
    location: "Somali Region - Warder",
    attachments: [
      "https://images.unsplash.com/photo-1510255479038-038e2ec647f1?auto=format&fit=crop&q=80&w=400",
    ],
    affectedPopulationCount: 4500,
    requiresUrgentMedical: true,
    infrastructureDamage: ["Wells"],
    reportedBy: "ngo_water",
    createdAt: new Date("2026-03-20T10:00:00Z"),
    updatedAt: new Date("2026-04-10T15:20:00Z"),
  },
];

export const MOCK_DISASTERS: Disaster[] = [
  {
    id: "dis-001",
    title: "National Awash Flooding 2026",
    description:
      "Major disaster declaration due to overflowing Awash river displacing thousands.",
    type: "FLOOD",
    status: "ACTIVE",
    severity: "CRITICAL",
    location: "Awash River Basin (Afar, Oromia, Amhara)",
    totalAffectedPopulation: 125000,
    requiresUrgentMedical: true,
    infrastructureDamage: ["Major Highways", "14 Bridges", "Power Grid"],
    attachments: [
      "https://images.unsplash.com/photo-1547683905-f686c993aae5?auto=format&fit=crop&q=80&w=400",
    ],
    estimatedEconomicLoss: 45000000,
    budgetAllocated: 10000000,
    declaredBy: "idrmc_commissioner_01",
    linkedIncidentIds: ["inc-001"],
    createdAt: new Date("2026-04-13T00:00:00Z"),
    updatedAt: new Date("2026-04-13T00:00:00Z"),
    activatedAt: new Date("2026-04-13T02:00:00Z"),
  },
  {
    id: "dis-002",
    title: "Eastern Region Drought",
    description: "Severe drought progressing rapidly across multiple woredas.",
    type: "DROUGHT",
    status: "VERIFIED",
    severity: "HIGH",
    location: "Somali & Oromia Regions",
    totalAffectedPopulation: 340000,
    requiresUrgentMedical: true,
    infrastructureDamage: [],
    attachments: [
      "https://images.unsplash.com/photo-1615967083049-9c59f0f9c211?auto=format&fit=crop&q=80&w=400",
    ],
    estimatedEconomicLoss: 120000000,
    budgetAllocated: 50000000,
    declaredBy: "idrmc_commissioner_01",
    linkedIncidentIds: ["inc-005"],
    createdAt: new Date("2026-03-25T11:00:00Z"),
    updatedAt: new Date("2026-04-11T16:00:00Z"),
  },
];

export const MOCK_NOTIFICATIONS: Notificaion[] = [
  {
    id: "notif-001",
    title: "New Disaster Declared",
    message:
      "National Awash Flooding 2026 has been declared a critical disaster.",
    recipient: "user_123",
    type: "in_app" as NotificationType,
    status: "read" as NotificationStatus,
    createdAt: new Date("2026-04-13T03:00:00Z"),
    updatedAt: new Date("2026-04-13T03:05:00Z"),
  },
  {
    id: "notif-002",
    title: "Incident Verified",
    message: "Forest Fire - Bale Mountains is verified.",
    recipient: "user_123",
    type: "sms" as NotificationType,
    status: "sent" as NotificationStatus,
    createdAt: new Date("2026-04-12T10:00:00Z"),
    updatedAt: new Date("2026-04-12T10:00:00Z"),
  },
  {
    id: "notif-003",
    title: "Update on Drought",
    message: "Additional budget allocated to Eastern Region Drought.",
    recipient: "user_123",
    type: "email" as NotificationType,
    status: "pending" as NotificationStatus,
    createdAt: new Date("2026-04-14T08:00:00Z"),
    updatedAt: new Date("2026-04-14T08:00:00Z"),
  },
];

export const getStatusColor = (
  status: IncidentStatus | DisasterStatus,
): string => {
  switch (status) {
    case "PENDING":
      return "#9fa4a9";
    case "VERIFIED":
      return "#afbfc0";
    case "ACTIVE":
      return "#56494c";
    case "RESOLVED":
      return "#847e89";
    case "REPEATED":
      return "#847e89";
    case "FALSE_ALARM":
    case "REJECTED":
      return "#56494c";
    default:
      return "#9fa4a9";
  }
};
