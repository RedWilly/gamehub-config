import { Metadata } from "next";

/**
 * Page displayed when a user is suspended
 * Shows suspension details and when they can return
 */
export const metadata: Metadata = {
  title: "Account Suspended - GameHub Configuration Directory",
  description: "Your account has been temporarily suspended",
};

import SuspendedPageClient from "./suspended-client";

export default function SuspendedPage() {
  return <SuspendedPageClient />;
}
