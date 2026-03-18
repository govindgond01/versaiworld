import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Custom hook for debounced navigation to prevent rapid navigation clicks
 * Industry standard: 300ms debounce delay
 */
const useDebouncedNavigation = (delay = 300) => {
  const navigate = useNavigate();
  const navigationRef = useRef(false);

  const debouncedNavigate = useCallback((path, options = {}) => {
    if (navigationRef.current) {
      return; // Already navigating, ignore duplicate requests
    }

    navigationRef.current = true;
    navigate(path, options);

    setTimeout(() => {
      navigationRef.current = false;
    }, delay);
  }, [navigate, delay]);

  return debouncedNavigate;
};

export default useDebouncedNavigation;