import { useState, useEffect } from 'react';
import { Theme } from '../Theme';

const MOBILE_QUERY = `(max-width: ${Theme.Breakpoints.tablet}px)`;

export const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(
    () => window.matchMedia(MOBILE_QUERY).matches
  );

  useEffect((): (() => void) => {
    const media: MediaQueryList = window.matchMedia(MOBILE_QUERY);
    const listener = (event: MediaQueryListEvent): void => {
      setIsMobile(event.matches);
    };
    media.addEventListener('change', listener);
    return (): void => {
      media.removeEventListener('change', listener);
    };
  }, []);

  return isMobile;
};
