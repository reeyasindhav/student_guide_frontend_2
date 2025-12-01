import { useEffect, useRef } from "react";

/**
 * Hook to create an AbortController that automatically aborts on unmount
 * Useful for canceling fetch requests when component unmounts
 */
export function useAbortController() {
  const abortControllerRef = useRef(null);

  useEffect(() => {
    abortControllerRef.current = new AbortController();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return abortControllerRef.current;
}
