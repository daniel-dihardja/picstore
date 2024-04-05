import { useEventSource } from "remix-utils/sse/react";

export const useProgress = <T>(
  id: string,
  progressBaseUrl = "/create/progress"
) => {
  const progressStream = useEventSource(`${progressBaseUrl}/${id}`, {
    event: id.toString(),
  });

  if (progressStream) {
    try {
      const event = JSON.parse(progressStream) as T;

      return { success: true, event } as const;
    } catch (cause) {
      return { success: false };
    }
  }
};
