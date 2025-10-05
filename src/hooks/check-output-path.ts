import { stat } from "@tauri-apps/plugin-fs";
import { useEffect, useState } from "react";

/**
 * Custom React hook to check if a given output path is a valid directory.
 *
 * @param outputPath - The path to check.
 * @returns An object containing:
 *   - error: A string describing any error found, or an empty string if valid.
 *   - isCheckingPath: A boolean indicating if the path is currently being checked.
 */
export function useCheckOutputPath(outputPath: string) {
  const [error, setError] = useState("");
  const [isCheckingPath, setIsCheckingPath] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function tryPath() {
      try {
        const entry = await stat(outputPath);

        if (entry.isFile) {
          throw "";
        }

        setError("");
      } catch (e: any) {
        if (typeof e === "string") {
          setError("This path does not point to a directory.");
        } else {
          setError("Error: " + e);
        }
      }

      setIsCheckingPath(false);
    }

    setTimeout(() => {
      if (mounted) {
        tryPath();
      }
    }, 1000);

    setIsCheckingPath(true);

    return () => {
      mounted = false;
    };
  }, [outputPath]);

  return {
    error,
    isCheckingPath,
  };
}
