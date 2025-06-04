import { useEffect, useState } from "react";

export function useIsMounted() {
  const [state, setState] = useState(false);

  useEffect(() => {
    setState(true);
  }, []);

  return state;
}
