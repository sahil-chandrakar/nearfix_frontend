"use client";

import { useEffect, useState } from "react";
import { DEFAULT_SUPPORT_DETAILS } from "@/config/support";
import { getSupportDetails } from "@/services/auth-service";
import type { SupportDetails } from "@/types/support";

export function useSupportDetails() {
  const [supportDetails, setSupportDetails] = useState<SupportDetails>(
    DEFAULT_SUPPORT_DETAILS,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    getSupportDetails()
      .then((nextDetails) => {
        if (isMounted) {
          setSupportDetails(nextDetails);
        }
      })
      .catch(() => {
        // Keep static defaults when the public support endpoint is unavailable.
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { isLoading, supportDetails };
}
