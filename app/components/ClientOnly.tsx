import {useEffect, useState} from 'react';

/**
 * Renders children only on the client side to avoid hydration mismatches
 */
export function ClientOnly({children}: {children: React.ReactNode}) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return isClient ? <>{children}</> : null;
}