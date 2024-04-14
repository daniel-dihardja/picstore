import { useEventSource } from "remix-utils/sse/react";

export const useUploadProgress = <T>(
  uploadId: string,
  progressBaseUrl = "/create/progress"
) => {
  const progressStream = useEventSource(`${progressBaseUrl}/${uploadId}`, {
    event: uploadId.toString(),
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
