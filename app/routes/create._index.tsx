import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirectDocument,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { Header } from "~/components/Header";
import MT from "@material-tailwind/react";
const { Button } = MT;

import { queuePrompt } from "~/.server/comfyui";
import WebSocket from "ws";
import { listImages } from "~/.server/listImages";
import { progressEventBus } from "~/.server/progress-event-bus";
import { useProgress } from "~/utils/useProgress";
import { nanoid } from "nanoid";

interface ProgressData {
  value: number;
  max: number;
}

type ComfyProgressEvent = Readonly<{
  id: string;
  complete: boolean;
  percentage: number;
  float: number;
}>;

export async function loader({ request }: LoaderFunctionArgs) {
  const { searchParams } = new URL(request.url);
  const style = searchParams.get("style");
  const files = await listImages();
  const images = files
    ?.filter((e) => e.Key?.includes(".png"))
    .map((e) => `${process.env.PICSTORE_URL}/${e.Key}`)
    .reverse();
  const clientId = nanoid();

  return json({ style, images, clientId });
}

const trackProgress = async (
  promptId: string,
  ws: WebSocket,
  callback: {
    onProgress: (value: number, max: number) => void;
    onDone: () => void;
  }
) => {
  return new Promise((resolve) => {
    ws.on("message", (data, isBinary) => {
      if (isBinary) {
        console.debug("Received binary data");
        return;
      }
      const jd: {
        type: string;
        data: undefined | ProgressData;
      } = JSON.parse(data.toString());
      if (jd.type === "progress") {
        const { value, max } = jd.data as ProgressData;
        callback.onProgress(value, max);
        if (value === max) {
          ws.off("message", () => {});
          // add 2 secs after completion to allow some time to upload to s3
          setTimeout(() => {
            callback.onDone();
            resolve(json({ promptId }));
          }, 2000);
        }
      }
      // if (jd.type === "status") {
      //   if (jd.data?.status.exec_info) {
      //     console.log(jd.data?.status.exec_info);
      //     const queueRemaining = jd.data?.status.exec_info.queue_remaining;
      //     if (queueRemaining === 0) {
      //       resolve(json({ promptId }));
      //     }
      //   }
      // }
    });
  });
};

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  const style = body.get("style") || "default";

  const url = new URL(request.url);
  const clientId = url.searchParams.get("clientId") as string;

  const imgName = "";
  const promptId = await queuePrompt(
    style.toString(),
    clientId,
    imgName,
    "http://127.0.0.1:8188"
  );

  const ws = new WebSocket(`ws://127.0.0.1:8188/ws?clientId=${clientId}`, {
    perMessageDeflate: false,
  });

  await trackProgress(promptId, ws, {
    onProgress: (value: number, max: number) => {
      console.log({ value, max });
      progressEventBus.emit<ComfyProgressEvent>({
        id: clientId,
        percentage: Math.round((value / max) * 100),
        float: value / max,
        complete: false,
      });
    },
    onDone: () => {
      console.log("Done");
      progressEventBus.emit<ComfyProgressEvent>({
        id: clientId,
        percentage: 100,
        float: 1,
        complete: true,
      });
    },
  });

  return redirectDocument(`/create?style=${style}`);
}

interface loaderDataType {
  style: string;
  images: string[];
  clientId: string;
}

interface actionDataType {
  url: string;
}

export default function Create() {
  const loaderData = useLoaderData<loaderDataType>();
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (loaderData) {
      setImages(loaderData.images);
    }
  }, [loaderData]);

  const progress = useProgress<ComfyProgressEvent>(loaderData.clientId);
  const actionUrl = `/create?clientId=${loaderData.clientId}`;

  return (
    <div className="container mx-auto px-4 py-4">
      <Header></Header>

      <div className="columns-1 flex place-content-center mt-20">
        <Form action={actionUrl} method="POST">
          <input type="hidden" name="style" value={loaderData.style} />
          <Button type="submit">Generate</Button>
        </Form>
      </div>

      {progress?.success && progress.event ? (
        <p>{progress.event.percentage} %</p>
      ) : null}

      <div className="columns-3 gap-4 mt-6">
        {images.map((imageUrl, index) => (
          <div key={index} className="flex place-content-center">
            <img src={imageUrl} alt={`Gallery item ${index}`} width="320" />
          </div>
        ))}
      </div>
    </div>
  );
}

function useFileUpload() {
  const { submit, data, state, formData } = useFetcher<typeof action>();
  const isUploading = state !== "idle";

  const uploadingFiles = formData
    ?.getAll("file")
    ?.filter((value: unknown): value is File => value instanceof File)
    .map((file) => {
      const name = file.name;
      // This line is important, this will create an Object URL, which is a `blob:` URL string
      // We'll need this to render the image in the browser as it's being uploaded
      const url = URL.createObjectURL(file);
      return { name, url };
    });

  const images = (data?.files ?? []).concat(uploadingFiles ?? []);

  return {
    submit(files: FileList | null) {
      if (!files) {
        return;
      }
      const formData = new FormData();
      for (const file of files) {
        formData.append("file", file);
      }
      submit(formData, { method: "POST", encType: "multipart/form-data" });
    },
    isUploading,
    images,
  };
}

function Image({ name, url }: { name: string; url: string }) {
  // Here we store the object URL in a state to keep it between renders
  const [objectUrl] = useState(() => {
    if (url.startsWith("blob:")) return url;
    return undefined;
  });

  useEffect(() => {
    // If there's an objectUrl but the `url` is not a blob anymore, we revoke it
    if (objectUrl && !url.startsWith("blob:")) URL.revokeObjectURL(objectUrl);
  }, [objectUrl, url]);

  return (
    <img
      alt={name}
      src={url}
      width={512}
      className="h-96 object-center shadow-xl shadow-blue-gray-900/50"
      style={{
        // Some styles, here we apply a blur filter when it's being uploaded
        transition: "filter 300ms ease",
        filter: url.startsWith("blob:") ? "blur(4px)" : "blur(0)",
      }}
    />
  );
}
