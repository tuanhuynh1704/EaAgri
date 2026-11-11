const PRIVATE_LOG_FIELDS = [
  "ip_address",
  "user_email",
  "user_name",
  "user_id",
  "device_id",
  "referrer",
];

const PRIVATE_HISTORY_FIELDS = [
  "ip_address",
  "user_email",
  "user_name",
  "user_id",
  "device_id",
  "referrer",
];

function scrub(item, privateFields) {
  if (!item || typeof item !== "object") return item;
  const safe = { ...item };
  for (const field of privateFields) delete safe[field];
  return safe;
}

/** Remove personal data from a visitor log before returning it to a guest. */
export function sanitizeVisitorLog(item) {
  return scrub(item, PRIVATE_LOG_FIELDS);
}

/** Remove personal data from a history event before returning it to a guest. */
export function sanitizeVisitorHistory(item) {
  return scrub(item, PRIVATE_HISTORY_FIELDS);
}

export function sanitizeVisitorLogs(items) {
  return Array.isArray(items) ? items.map(sanitizeVisitorLog) : [];
}

export function sanitizeVisitorHistoryList(items) {
  return Array.isArray(items) ? items.map(sanitizeVisitorHistory) : [];
}
