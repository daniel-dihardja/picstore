import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirectDocument,
  unstable_parseMultipartFormData,
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
const { Button, Card, CardBody } = MT;

import { queuePrompt } from "~/.server/comfyui";
import WebSocket from "ws";
import { listImages } from "~/.server/listImages";
import { progressEventBus } from "~/.server/progress-event-bus";
import { useProgress } from "~/utils/useProgress";
import { nanoid } from "nanoid";
import { Pic } from "~/components/Pic";
import { PicProgress } from "~/components/PicProgress";
import { UploadPanel } from "~/components/UploadPanel";
import { s3UploaderHandler } from "~/.server/uploadToS3";

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
    onProgress: (data: ProgressData) => void;
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
        callback.onProgress({ value, max });
        if (value === max) {
          ws.off("message", () => {});
          // add 2 secs after completion to allow some time to upload to s3. Shall be improoved in the future
          setTimeout(() => {
            callback.onDone();
            resolve(json({ promptId }));
          }, 2000);
        }
      }
    });
  });
};

async function generate(request: Request) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("clientId") as string;
  const style = url.searchParams.get("style") as string;
  const promptId = await queuePrompt(
    style as string,
    clientId,
    "",
    "http://127.0.0.1:8188"
  );

  const ws = new WebSocket(`ws://127.0.0.1:8188/ws?clientId=${clientId}`, {
    perMessageDeflate: false,
  });

  await trackProgress(promptId, ws, {
    onProgress: (data: ProgressData) => {
      const { value, max } = data;
      progressEventBus.emit<ComfyProgressEvent>({
        id: clientId,
        percentage: Math.round((value / max) * 100),
        float: value / max,
        complete: false,
      });
    },
    onDone: () => {
      progressEventBus.emit<ComfyProgressEvent>({
        id: clientId,
        percentage: 100,
        float: 1,
        complete: true,
      });
    },
  });
}

async function upload(request: Request) {
  const formData = await unstable_parseMultipartFormData(
    request,
    s3UploaderHandler
  );

  return json({ inputImage: formData.get("file") });
}

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") as string;

  switch (type) {
    case "generate":
      await generate(request);
      return redirectDocument(request.url);
    case "upload":
      return await upload(request);
    default:
      return json({});
  }
}

interface loaderDataType {
  style: string;
  images: string[];
  clientId: string;
}

interface actionDataType {
  inputImage: string;
}

export default function Create() {
  const loaderData = useLoaderData<loaderDataType>();
  const actionData = useActionData<actionDataType>();
  const [images, setImages] = useState<string[]>([]);
  const [inputImage, setInputImage] = useState<string>("");

  useEffect(() => {
    if (loaderData) {
      setImages(loaderData.images);
    }
    if (actionData) {
      setInputImage(actionData.inputImage);
    }
  }, [loaderData, actionData]);

  const progress = useProgress<ComfyProgressEvent>(loaderData.clientId);
  const actionUrl = `/create?clientId=${loaderData.clientId}&style=${loaderData.style}`;

  return (
    <div>
      <Header></Header>
      <div className="container mx-auto px-4 py-4">
        <div className="columns-1 mt-6">
          <h1 className="mb-6 text-2xl">{loaderData.style}</h1>
          <Card>
            <CardBody className="p-3 h-96">
              <UploadPanel action={`${actionUrl}&type=upload`}></UploadPanel>
            </CardBody>
          </Card>
        </div>
        <div className="columns-1 flex place-content-center mt-20">
          <Form action={`${actionUrl}&type=generate`} method="POST">
            <Button type="submit">Generate</Button>
          </Form>
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          {progress?.success && progress.event ? (
            <PicProgress percentage={progress.event.percentage}></PicProgress>
          ) : null}

          {images.map((imageUrl, index) => (
            <Pic key={index} url={imageUrl}></Pic>
          ))}
        </div>
      </div>
    </div>
  );
}
