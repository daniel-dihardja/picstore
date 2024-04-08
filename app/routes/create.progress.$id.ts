import { LoaderFunctionArgs } from "@remix-run/node";
import { eventStream } from "remix-utils/sse/server";
import { ProgressEvent } from "~/services/progress-event-bus.server";
import { progressEventBus } from "~/services/progress-event-bus.server";

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
