// Import statements for necessary Remix and React hooks, components, and utilities.
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import {
  Form,
  Outlet,
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { Header } from "~/components/Header";
import MT from "@material-tailwind/react";
const { Button, Card, CardBody } = MT;

// Import server-side utilities for handling prompts, S3 image listings, and workflows.
import { WorkflowValues, queuePrompt } from "~/services/prompt-submiter.server";
import { listImages } from "~/services/s3-listImages.server";
import { nanoid } from "nanoid";
import { Pic } from "~/components/Pic";
import { UploadPanel } from "~/components/UploadPanel";
import { s3UploaderHandler } from "~/services/s3-upload.server";
import { PromptPanel } from "~/components/PromptPanel";
import { env } from "~/services/env.server";
import { uploadStreamToS3 } from "~/services/s3-upload.server";
import { authenticator } from "~/services/auth.server";
import { Usage } from "~/types";
import {
  createUserUsage,
  createUserBalanceFromUsage,
  getUserCredits,
} from "~/services";

import { progressEventBus } from "~/services/progress-event-bus.server";
import { useUploadProgress } from "~/services/use-upload-progress";
import { modelStatus$ } from "~/components/ModelStatus";

// Loader function: prepares data needed for the component to render.
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    // User is not authenticated, redirect them to the login page
    throw redirect("/signin");
  }
  const progressId = nanoid();

  //return json({ progressId });
  const { searchParams } = new URL(request.url);
  const workflowName = searchParams.get("m");
  const files = await listImages();
  const images = files
    ?.filter((e) => e.Key?.includes(".png"))
    .map((e) => `${env.PICSTORE_URL}/${e.Key}`)
    .reverse()
    .slice(0, 6);

  const credits = await getUserCredits(user.id);

  return json({ user, workflowName, images, credits, progressId });
}

// Handler for generating images based on prompts.
async function generate(request: Request) {
  if (env.ENABLE_GENERATE === "false") {
    return json({ generatedImage: "dino.jpeg" });
  }

  const formData = await request.formData();
  const userId = formData.get("userId") as string;

  const credits = await getUserCredits(userId);
  if (Number(credits) < 1) {
    return json({ error: "Insufficient credits" }, { status: 402 });
  }

  const prompt = formData.get("prompt") as string;
  const inputImage = formData.get("inputImage") as string;
  const workflowName = new URL(request.url).searchParams.get("m");

  const config: WorkflowValues = {
    seed: Math.round(Math.random() * 99999) as unknown as string,
    prompt: prompt,
    input_image: `${env.PICSTORE_URL}/input/` + inputImage,
  };

  const requestStartTime = Date.now();
  const res = await queuePrompt(workflowName as string, config);
  const requestEndTime = Date.now();

  const usage: Usage = {
    userId,
    serviceName: "img2img",
    requestStartTime,
    requestEndTime,
    totalTime: requestEndTime - requestStartTime,
  };

  // don't wait for the usage to be added
  createUserUsage(usage);
  createUserBalanceFromUsage(usage);

  const outputImages = await listImages();
  const buffer = res?.imgBuffer;
  const folder = "output";
  const key = `image_${outputImages.length.toString().padStart(5, "0")}.png`;
  const generatedImage = await uploadStreamToS3(
    buffer,
    key,
    "image/png",
    folder
  );

  return json({ generatedImage });
}

// Handler for uploading images.
async function upload(request: Request) {
  const formData = await unstable_parseMultipartFormData(
    request,
    s3UploaderHandler
  );
  const inputImage = formData.get("file")?.toString();
  return json({ inputImage });
}

// Main action handler for the component, routing based on the action type.
export async function action({ request }: ActionFunctionArgs) {
  const url = new URL(request.url);
  const type = url.searchParams.get("type") as string;

  switch (type) {
    case "generate":
      return generate(request);
    case "upload":
      return upload(request);
    default:
      return json({});
  }
}

// Main component function, renders the UI for creating and managing uploads and generations.
export default function Create() {
  const loaderData = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const [images, setImages] = useState<string[]>([]);
  const [inputImage, setInputImage] = useState<string>("");
  const [prompt, setPrompt] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [credits, setCredits] = useState(loaderData.credits || 0);
  const [user] = useState(loaderData.user);
  const [modelStatus, setModelStatus] = useState(modelStatus$.value);

  const navigate = useNavigate();

  // Effect hook for handling loader and action data.
  useEffect(() => {
    if (loaderData) {
      const { credits, images } = loaderData;
      credits ? setCredits(credits) : null;
      images ? setImages(loaderData.images as string[]) : null;
    }
    if (actionData) {
      if (actionData.inputImage) {
        setInputImage(actionData.inputImage as string);
        setIsUploading(false);
      }
      if (actionData.generatedImage) {
        console.log("generated: ", actionData.generatedImage);
        setIsGenerating(false);
      }
    }
  }, [loaderData, actionData]);

  useEffect(() => {
    modelStatus$.subscribe((status) => setModelStatus(status));
  }, []);

  const progress = useUploadProgress<ProgressData>(loaderData.progressId);
  const actionUrl = `/create?progressId=${loaderData.progressId}&m=${loaderData.workflowName}`;

  // Component render function.
  return (
    <>
      <Header credits={credits} user={user}></Header>
      <div className="container mx-auto px-4">
        <Outlet />
      </div>
    </>
  );
}
