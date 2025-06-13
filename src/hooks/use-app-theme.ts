import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function useAppTheme() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      console.log(`Theme changed - Current: ${theme}, Resolved: ${resolvedTheme}`);
    }
  }, [theme, resolvedTheme, mounted]);

  return {
    theme: mounted ? (resolvedTheme || theme || 'light') : 'light',
    setTheme,
  };
}
