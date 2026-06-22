import type { AuthUser } from "@/lib/api/auth";

export type GuestDetails = {
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone: string;
};

const EMPTY: GuestDetails = {
  firstName: "",
  lastName: "",
  fullName: "",
  email: "",
  phone: "",
};

/** Map signed-in user profile to guest / contact form fields. */
export function guestDetailsFromUser(user: AuthUser | null | undefined): GuestDetails {
  if (!user) return EMPTY;

  const email = user.email?.trim() ?? "";
  const phone = user.phone?.trim() ?? "";
  const fullName = user.name?.trim() ?? "";

  let firstName = "";
  let lastName = "";
  if (fullName) {
    const parts = fullName.split(/\s+/);
    firstName = parts[0] ?? "";
    lastName = parts.length > 1 ? parts.slice(1).join(" ") : "";
  }

  return { firstName, lastName, fullName, email, phone };
}

/** Prefer existing field values; fill only when empty. */
export function mergeGuestDetails(
  current: GuestDetails,
  fromUser: GuestDetails,
): GuestDetails {
  return {
    firstName: current.firstName || fromUser.firstName,
    lastName: current.lastName || fromUser.lastName,
    fullName: current.fullName || fromUser.fullName,
    email: current.email || fromUser.email,
    phone: current.phone || fromUser.phone,
  };
}
