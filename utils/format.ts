export const formatLabel = (val: string): string => {
  if (val === "ALL") return "All";
  return val.replace(/_/g, " ").charAt(0) + val.replace(/_/g, " ").slice(1).toLowerCase();
};

export const severityValue = (severity: string): number => {
  switch (severity?.toUpperCase()) {
    case "CRITICAL": return 4;
    case "HIGH": return 3;
    case "MEDIUM": return 2;
    case "LOW": return 1;
    default: return 0;
  }
};
