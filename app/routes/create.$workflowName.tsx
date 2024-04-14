// Import statements for necessary Remix and React hooks, components, and utilities.
import MT from "@material-tailwind/react";
import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import {
  Form,
  useActionData,
  useLoaderData,
  useNavigate,
  useParams,
} from "@remix-run/react";
import { useEffect, useState } from "react";
const { Button, Card, CardBody } = MT;

// Import server-side utilities for handling prompts, S3 image listings, and workflows.
import { Pic } from "~/components/Pic";
import { PromptPanel } from "~/components/PromptPanel";
import { UploadPanel } from "~/components/UploadPanel";
import {
  createUserBalanceFromUsage,
  createUserUsage,
  getUserCredits,
} from "~/services";
import { authenticator } from "~/services/auth.server";
import { env } from "~/services/env.server";
import { WorkflowValues, queuePrompt } from "~/services/prompt-submiter.server";
import { listImages } from "~/services/s3-listImages.server";
import {
  uploadStreamToS3,
  useS3UploaderHandler,
} from "~/services/s3-upload.server";
import { Usage } from "~/types";

import { modelStatus$ } from "~/components/ModelStatus";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    throw redirect("/signin");
  }

  const workflowName = params["workflowName"];
  const files = await listImages(user.id);
  const images = files
    ?.filter((e) => e.Key?.includes(".png"))
    .map((e) => `${env.PICSTORE_URL}/${e.Key}`)
    .reverse()
    .slice(0, 6);

  return json({ user, workflowName, images });
}

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
    input_image: `${env.PICSTORE_URL}/${inputImage}`,
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

  const outputImages = await listImages(userId);
  const buffer = res?.imgBuffer;
  const key = `${userId}/output/image_${outputImages.length
    .toString()
    .padStart(5, "0")}.png`;
  const generatedImage = await uploadStreamToS3(
    buffer as Buffer,
    key,
    "image/png"
  );

  console.log("generated image: ", generatedImage);

  return json({ generatedImage });
}

async function upload(request: Request) {
  const q = new URL(request.url).searchParams;
  const userId = q.get("u") as string;

  const formData = await unstable_parseMultipartFormData(
    request,
    useS3UploaderHandler(userId)
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
  const [isGenerating, setIsGenerating] = useState(false);

  const [user] = useState(loaderData.user);
  const [modelStatus, setModelStatus] = useState(modelStatus$.value);

  const navigate = useNavigate();

  useEffect(() => {
    if (loaderData) {
      const { images } = loaderData;
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

  const actionUrl = `/create/img2img?u=${loaderData.user.id}&m=${loaderData.workflowName}`;

  return (
    <div>
      <div className="columns-1">
        <Button
          variant="text"
          className="mb-4 rounded-full"
          onClick={() => navigate("/create")}
        >
          Back
        </Button>
        <Card>
          <CardBody className="p-3 md:h-full">
            <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-2 h-full">
              <UploadPanel
                action={`${actionUrl}&type=upload`}
                image={`${inputImage}`}
                isUploading={isUploading}
                onUpload={() => setIsUploading(true)}
              ></UploadPanel>
              <PromptPanel
                onChange={(prompt) => setPrompt(prompt)}
              ></PromptPanel>
            </div>
          </CardBody>
        </Card>
      </div>
      <div className="columns-1 flex place-content-center my-12">
        <Form
          action={`${actionUrl}&type=generate`}
          method="POST"
          onSubmit={() => setIsGenerating(true)}
        >
          <input type="hidden" name="prompt" value={prompt}></input>
          <input type="hidden" name="inputImage" value={inputImage}></input>
          <input type="hidden" name="userId" value={user.id}></input>
          <Button
            type="submit"
            className="rounded-full"
            size="lg"
            // disabled={modelStatus.status !== "ACTIVE"}
            loading={isGenerating}
          >
            Generate
          </Button>
        </Form>
      </div>

      <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {images.map((imageUrl, index) => (
          <Pic key={index} url={imageUrl}></Pic>
        ))}
      </div>
    </div>
  );
}
