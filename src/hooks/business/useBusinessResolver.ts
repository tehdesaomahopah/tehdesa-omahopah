
import { useState, useEffect } from "react";
import { Business } from "@/types/supabase";
import { getBusinessById, getBusinessByName } from "@/services/businessService";

/**
 * A hook to resolve a business identifier (name or UUID) to a Business object
 */
export const useBusinessResolver = (businessId: string | undefined) => {
  const [business, setBusiness] = useState<Business | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const resolveBusinessId = async () => {
      if (!businessId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Check if the ID is a UUID
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        
        if (uuidRegex.test(businessId)) {
          // It's a UUID, use getBusinessById
          const result = await getBusinessById(businessId);
          setBusiness(result);
        } else {
          // It's a name or slug, use getBusinessByName
          const result = await getBusinessByName(businessId);
          setBusiness(result);
        }
      } catch (err) {
        console.error("Error resolving business ID:", err);
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    resolveBusinessId();
  }, [businessId]);

  return {
    business,
    isLoading,
    error,
    resolvedId: business?.id
  };
};
