import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Hook to cleanup/reset state when navigating away from a page
 * This helps prevent stale state and duplicate API calls
 */
export function usePageCleanup(cleanupFn) {
  const pathname = usePathname();

  useEffect(() => {
    return () => {
      // Cleanup when component unmounts or pathname changes
      if (cleanupFn) {
        cleanupFn();
      }
    };
  }, [pathname, cleanupFn]);
}
