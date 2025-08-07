const getGMTtoSeconds = (): number => {
  // Get the current time zone offset in minutes
  const gmtOffset = new Date().getTimezoneOffset();
  return gmtOffset * 60;
};

export const formatTimestamp = (timestamp: number): string => {
  const now = Math.floor(Date.now() / 1000) + getGMTtoSeconds(); // Add 3 hours to the current time

  const diff = now - timestamp;
  if (diff < 1) return "just now";
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return `${Math.floor(diff / 604800)}w ago`;
};
