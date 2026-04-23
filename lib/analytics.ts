type EventName =
  | "page_view"
  | "workout_created"
  | "workout_edited"
  | "workout_deleted"
  | "video_uploaded"
  | "video_deleted"
  | "video_annotated"
  | "body_log_created"
  | "capture_started"
  | "capture_completed"
  | "template_saved"
  | "template_used"
  | "share_link_created"
  | "export_csv"
  | "onboarding_completed"
  | "onboarding_skipped";

interface StoredEvent {
  name: EventName;
  properties?: Record<string, unknown>;
  timestamp: string;
  sessionId: string;
}

const STORAGE_KEY = "gym_analytics_events";
const USER_KEY = "gym_analytics_user";
const MAX_EVENTS = 1000;

let sessionId: string | null = null;

function getSessionId(): string {
  if (!sessionId) {
    sessionId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  }
  return sessionId;
}

function isClient(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readEvents(): StoredEvent[] {
  if (!isClient()) return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function writeEvents(events: StoredEvent[]): void {
  if (!isClient()) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
}

/**
 * Track an analytics event.
 *
 * To migrate to PostHog, add:
 *   posthog.capture(name, { ...properties, sessionId: getSessionId() });
 */
export function trackEvent(
  name: EventName,
  properties?: Record<string, unknown>,
): void {
  const event: StoredEvent = {
    name,
    properties,
    timestamp: new Date().toISOString(),
    sessionId: getSessionId(),
  };

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", name, properties);
  }

  const events = readEvents();
  events.push(event);
  if (events.length > MAX_EVENTS) {
    events.splice(0, events.length - MAX_EVENTS);
  }
  writeEvents(events);
}

/**
 * Associate future events with a user.
 *
 * To migrate to PostHog, add:
 *   posthog.identify(userId, traits);
 */
export function identify(
  userId: string,
  traits?: Record<string, unknown>,
): void {
  if (!isClient()) return;

  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics] identify", userId, traits);
  }

  localStorage.setItem(USER_KEY, JSON.stringify({ userId, traits }));
}

/**
 * Clear stored identity and session (e.g. on sign-out).
 *
 * To migrate to PostHog, add:
 *   posthog.reset();
 */
export function resetAnalytics(): void {
  if (!isClient()) return;
  sessionId = null;
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(STORAGE_KEY);
}

/** Return all stored events — useful for debugging. */
export function getStoredEvents(): StoredEvent[] {
  return readEvents();
}
