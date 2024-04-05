import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  Session,
  SessionData,
  json,
  redirectDocument,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import {
  Form,
  Link,
  useActionData,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { Header } from "~/components/Header";
import MT from "@material-tailwind/react";
const { Button, IconButton, Card, CardBody, Breadcrumbs } = MT;

import { queuePrompt } from "~/.server/comfyui";
import WebSocket from "ws";
import { listImages } from "~/.server/s3-listImages";
import { progressEventBus } from "~/.server/progress-event-bus";
import { useProgress } from "~/utils/useProgress";
import { nanoid } from "nanoid";
import { Pic } from "~/components/Pic";
import { PicProgress } from "~/components/PicProgress";
import { UploadPanel } from "~/components/UploadPanel";
import { s3UploaderHandler } from "~/.server/s3-upload";
import { loadWorkflow } from "~/.server/workflow-loader";
import { PromptPanel } from "~/components/PromptPanel";
import { getSession, commitSession } from "../sessions";

import { useLocation } from "@remix-run/react";

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
  const workflowName = searchParams.get("m");
  const files = await listImages();
  const images = files
    ?.filter((e) => e.Key?.includes(".png"))
    .map((e) => `${process.env.PICSTORE_URL}/${e.Key}`)
    .reverse();
  const clientId = nanoid();

  return json({ clientId, workflowName, images });
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
  const workflowName = url.searchParams.get("m") as string;

  const formData = await request.formData();
  const prompt = formData.get("prompt") as string;
  const inputImage = formData.get("inputImage") as string;
  const workflow = await loadWorkflow(workflowName);

  if (inputImage) {
    workflow["10"].inputs.image = `/${inputImage}`;
  }

  if (prompt) {
    workflow["3"].inputs.text = prompt;
  }

  workflow["1"].inputs.seed = Math.round(Math.random() * 99999);

  const promptId = await queuePrompt(workflow, clientId);

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

  return json({
    inputImage,
  });
}

async function upload(request: Request) {
  const formData = await unstable_parseMultipartFormData(
    request,
    s3UploaderHandler
  );

  const inputImage = formData.get("file")?.toString();

  return json({ inputImage });
}

export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") as string;

  switch (type) {
    case "generate":
      return generate(request);
    case "upload":
      // eslint-disable-next-line no-case-declarations
      return upload(request);
    default:
      return json({});
  }
}

export default function Create() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [images, setImages] = useState<string[]>([]);
  const [inputImage, setInputImage] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (loaderData) {
      setImages(loaderData.images as string[]);
    }
    if (actionData) {
      if (actionData.inputImage) {
        setInputImage(actionData.inputImage as string);
        setIsUploading(false);
      }
    }
  }, [loaderData]);

  const progress = useProgress<ComfyProgressEvent>(loaderData.clientId);
  const actionUrl = `/create?clientId=${loaderData.clientId}&m=${loaderData.workflowName}`;

  return (
    <div>
      <Header></Header>
      <div className="container mx-auto px-4 py-4">
        <div className="columns-1 mt-6">
          <Link to="/explore" className="mb-4 inline-block hover:underline">
            Back
          </Link>
          <Card>
            <CardBody className="p-3 h-96">
              <div className="columns-2 h-full">
                <PromptPanel
                  onChange={(e) => setPrompt(e.currentTarget.value)}
                ></PromptPanel>
                <UploadPanel
                  action={`${actionUrl}&type=upload`}
                  image={inputImage}
                  isUploading={isUploading}
                  onUpload={() => setIsUploading(true)}
                ></UploadPanel>
              </div>
            </CardBody>
          </Card>
        </div>
        <div className="columns-1 flex place-content-center my-12">
          <Form action={`${actionUrl}&type=generate`} method="POST">
            <input type="hidden" name="prompt" value={prompt}></input>
            <input type="hidden" name="inputImage" value={inputImage}></input>
            <Button type="submit" className="rounded-full" size="lg">
              Generate
            </Button>
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
