import { useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useDebouncedNavigation = (delay = 300) => {
  const navigate = useNavigate();
  const timeoutRef = useRef(null);
  const lastPathRef = useRef(null);
  const lastTimestampRef = useRef(0);

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
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    const isSamePath = path === lastPathRef.current;
    const timeSinceLastNav = now - lastTimestampRef.current;
    
    // Agar same path hai aur recent navigation hui hai, toh double delay
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