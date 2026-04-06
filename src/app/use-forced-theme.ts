import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

export function useForcedTheme(forcedTheme: 'light' | 'dark') {
  const { theme, setTheme } = useTheme();
  const previousThemeRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    previousThemeRef.current = theme;
    setTheme(forcedTheme);

    return () => {
      if (previousThemeRef.current) {
        setTheme(previousThemeRef.current);
      }
    };
  }, []);
}
