
import { useState, useEffect } from "react";
import { Business } from "@/types/supabase";
import { getBusinessById, getBusinessByName } from "@/services/businessService";
import { useQuery } from "@tanstack/react-query";

/**
 * A hook to resolve a business identifier (name or UUID) to a Business object
 */
export const useBusinessResolver = (businessId: string | undefined) => {
  // Use React Query to cache the business data and prevent flickering
  const {
    data: business,
    isLoading,
    error
  } = useQuery({
    queryKey: ['business', businessId],
    queryFn: async () => {
      if (!businessId) {
        return null;
      }

      // Check if the ID is a UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      
      if (uuidRegex.test(businessId)) {
        // It's a UUID, use getBusinessById
        return await getBusinessById(businessId);
      } else {
        // It's a name or slug, use getBusinessByName
        return await getBusinessByName(businessId);
      }
    },
    staleTime: 5 * 60 * 1000, // Cache data for 5 minutes to prevent flickering
    enabled: !!businessId
  });

  return {
    business,
    isLoading,
    error,
    resolvedId: business?.id
  };
};
