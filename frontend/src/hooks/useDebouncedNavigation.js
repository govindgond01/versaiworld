import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for debounced navigation to prevent rapid navigation clicks
 * Only blocks repeated clicks on the SAME path while allowing navigation to different paths
 * Industry standard: 300ms debounce delay
 */
const useDebouncedNavigation = (delay = 300) => {
  const navigate = useNavigate();
  const lastNavigationRef = useRef({ path: null, timestamp: 0 });

  const debouncedNavigate = useCallback((path, options = {}) => {
    const now = Date.now();
    const { path: lastPath, timestamp: lastTimestamp } = lastNavigationRef.current;
    
    // Allow navigation if:
    // 1. Navigating to a different path than the last navigation, OR
    // 2. Sufficient time has passed since the last navigation (throttle)
    if (path !== lastPath || now - lastTimestamp > delay) {
      lastNavigationRef.current = { path, timestamp: now };
      navigate(path, options);
    }
    // Silently ignore rapid repeated clicks on the same path
  }, [navigate, delay]);

  return debouncedNavigate;
};

export default useDebouncedNavigation;