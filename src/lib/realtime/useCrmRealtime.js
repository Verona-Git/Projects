"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function useCrmRealtime({ onEnquiryChange, onProjectChange }) {
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("crm-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "enquiries" },
        (payload) => onEnquiryChange?.(payload)
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "active_projects" },
        (payload) => onProjectChange?.(payload)
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onEnquiryChange, onProjectChange]);
}
