export const statusOptions = [
  "ALL",
  "PENDING",
  "VERIFIED",
  "ACTIVE",
  "RESOLVED",
  "REPEATED",
  "FALSE_ALARM",
  "REJECTED",
] as const;

export const typeOptions = [
  "ALL",
  "FLOOD",
  "DROUGHT",
  "LANDSLIDE",
  "LOCUST",
  "CONFLICT",
  "FIRE",
] as const;

export const severityOptions = ["ALL", "LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

export const sortOptions = ["newest", "oldest", "highestSeverity", "lowestSeverity"] as const;

export const sortLabels: Record<string, string> = {
  newest: "Newest First", oldest: "Oldest First",
  highestSeverity: "Highest Severity", lowestSeverity: "Lowest Severity",
};

export type StatusFilter = (typeof statusOptions)[number];
export type TypeFilter = (typeof typeOptions)[number];
export type SeverityFilter = (typeof severityOptions)[number];
export type SortBy = (typeof sortOptions)[number];
