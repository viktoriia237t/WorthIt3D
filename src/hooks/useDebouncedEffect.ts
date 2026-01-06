import { useEffect, useRef } from 'react';

export function useDebouncedEffect(
  callback: () => void,
  delay: number,
  deps: React.DependencyList
) {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      callback();
    }, delay);

    // Cleanup on unmount or deps change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, deps);
}
