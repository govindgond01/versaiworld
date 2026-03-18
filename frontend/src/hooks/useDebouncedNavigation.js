import { useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for debounced navigation to prevent rapid navigation clicks
 * Industry standard: 300ms debounce delay with cleanup
 * Prevents infinite loops and excessive navigation
 */
const useDebouncedNavigation = (delay = 300) => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const lastPathRef = useRef(null);
  const lastTimestampRef = useRef(0);

  // Cleanup on unmount - CRITICAL for preventing memory leaks
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, []);

  const debouncedNavigate = useCallback((path, options = {}) => {
    const now = Date.now();
    
    // Clear any pending navigation
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // If same path and recent navigation, add extra delay
    const isSamePath = path === lastPathRef.current;
    const timeSinceLastNav = now - lastTimestampRef.current;
    
    // Dynamic delay - double if same path and recent
    const effectiveDelay = (isSamePath && timeSinceLastNav < delay * 2) ? delay * 2 : delay;

    timeoutRef.current = setTimeout(() => {
      navigate(path, { replace: options.replace || false });
      lastPathRef.current = path;
      lastTimestampRef.current = Date.now();
      timeoutRef.current = null;
    }, effectiveDelay);
  }, [navigate, delay]);

  return debouncedNavigate;
};

export default useDebouncedNavigation;