"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { useCrmRealtime } from "@/lib/realtime/useCrmRealtime";

export default function CrmRealtimeRefresh() {
  const router = useRouter();
  const refresh = useCallback(() => router.refresh(), [router]);

  useCrmRealtime({
    onEnquiryChange: refresh,
    onProjectChange: refresh
  });

  return null;
}
