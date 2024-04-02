import { LoaderFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";
import { ProgressEvent } from "~/.server/progress-event-bus";
import { progressEventBus } from "~/.server/progress-event-bus";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const id = params.id as string;
  return eventStream(request.signal, (send) => {
    const handle = (event: ProgressEvent) => {
      send({
        event: event.id,
        data: JSON.stringify(event),
      });
    };

    progressEventBus.addListener(id, handle);

    return () => {
      progressEventBus.removeListener(id, handle);
    };
  });
}
