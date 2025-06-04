import { useTheme } from "next-themes";

export function useAppTheme() {
  const { setTheme, resolvedTheme } = useTheme();

  return {
    theme: resolvedTheme,
    setTheme,
  };
}
