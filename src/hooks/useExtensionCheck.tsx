import { useEffect, useState } from "react";

export function useExtensionCheck(extensionId: string): boolean | null {
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);

  useEffect(() => {
    if (!window.chrome?.runtime?.sendMessage) {
      setIsInstalled(false);
      return;
    }

    try {
      chrome.runtime.sendMessage(
        extensionId,
        { type: "PING" },
        (response) => {
          if (chrome.runtime.lastError || !response?.ok) {
            setIsInstalled(false);
          } else {
            setIsInstalled(true);
          }
        }
      );
    } catch (err) {
      setIsInstalled(false);
    }
  }, [extensionId]);

  return isInstalled;
}