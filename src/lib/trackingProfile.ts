import { safeGetLocalStorageItem, safeSetLocalStorageItem } from "@/lib/safeStorage";
import type { CAPIUserData } from "@/lib/facebook-pixel";

const TRACKING_PROFILE_KEY = "tracking_profile";

type StoredTrackingProfile = Partial<
  Pick<CAPIUserData, "phone" | "firstName" | "lastName" | "city" | "state" | "email">
>;

function splitName(fullName?: string) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export function getTrackingProfile(): StoredTrackingProfile {
  const raw = safeGetLocalStorageItem(TRACKING_PROFILE_KEY);
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }
    return parsed as StoredTrackingProfile;
  } catch {
    return {};
  }
}

export function saveTrackingProfile(input: {
  name?: string;
  phone?: string;
  city?: string;
  state?: string;
  email?: string;
}) {
  const existing = getTrackingProfile();
  const { firstName, lastName } = splitName(input.name);

  const nextProfile: StoredTrackingProfile = {
    ...existing,
    ...(input.phone?.trim() ? { phone: input.phone.trim() } : {}),
    ...(firstName ? { firstName } : {}),
    ...(lastName ? { lastName } : {}),
    ...(input.city?.trim() ? { city: input.city.trim() } : {}),
    ...(input.state?.trim() ? { state: input.state.trim() } : {}),
    ...(input.email?.trim() ? { email: input.email.trim() } : {}),
  };

  safeSetLocalStorageItem(TRACKING_PROFILE_KEY, JSON.stringify(nextProfile));
  return nextProfile;
}
