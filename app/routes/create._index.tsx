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
  useActionData,
  useLoaderData,
  useNavigate,
} from "@remix-run/react";
import { useEffect, useState } from "react";
import { Header } from "~/components/Header";
import MT from "@material-tailwind/react";
const { Button, Card, CardBody } = MT;

// Import server-side utilities for handling prompts, S3 image listings, and workflows.
import { WorkflowValues, queuePrompt } from "~/.server/prompt-submiter";
import { listImages } from "~/.server/s3-listImages";
import { nanoid } from "nanoid";
import { Pic } from "~/components/Pic";
import { UploadPanel } from "~/components/UploadPanel";
import { s3UploaderHandler } from "~/.server/s3-upload";
import { PromptPanel } from "~/components/PromptPanel";
import { env } from "~/.server/env";
import { uploadStreamToS3 } from "~/.server/s3-upload";
import { authenticator } from "~/services/auth.server";

// Loader function: prepares data needed for the component to render.
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    // User is not authenticated, redirect them to the login page
    throw redirect("/signin");
  }

  const { searchParams } = new URL(request.url);
  const workflowName = searchParams.get("m");
  const files = await listImages();
  const images = files
    ?.filter((e) => e.Key?.includes(".png"))
    .map((e) => `${env.PICSTORE_URL}/${e.Key}`)
    .reverse()
    .slice(0, 6);

  const clientId = nanoid();

  return json({ clientId, workflowName, images });
}

// Handler for generating images based on prompts.
async function generate(request: Request) {
  if (env.ENABLE_GENERATE === "false") {
    return json({ generatedImage: "dino.jpeg" });
  }

  const formData = await request.formData();
  const prompt = formData.get("prompt") as string;
  const inputImage = formData.get("inputImage") as string;
  const workflowName = new URL(request.url).searchParams.get("m");

  const config: WorkflowValues = {
    seed: Math.round(Math.random() * 99999) as unknown as string,
    prompt: prompt,
    input_image: `${env.PICSTORE_URL}/input/` + inputImage,
  };

  const res = await queuePrompt(workflowName as string, config);
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

  const navigate = useNavigate();

  // Effect hook for handling loader and action data.
  useEffect(() => {
    if (loaderData) {
      setImages(loaderData.images as string[]);
    }
    if (actionData) {
      if (actionData.inputImage) {
        setInputImage(actionData.inputImage as string);
        setIsUploading(false);
      }
      if (actionData.generatedImage) {
        setIsGenerating(false);
      }
    }
  }, [loaderData, actionData]);

  const actionUrl = `/create?clientId=${loaderData.clientId}&m=${loaderData.workflowName}`;

  // Component render function.
  return (
    <div>
      <Header></Header>
      <div className="container mx-auto px-4 py-4">
        <div className="columns-1 mt-6">
          <Button
            variant="text"
            className="mb-4 rounded-full"
            onClick={() => navigate("/explore")}
          >
            Back
          </Button>
          <Card>
            <CardBody className="p-3 md:h-full">
              <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-2 h-full">
                <UploadPanel
                  action={`${actionUrl}&type=upload`}
                  image={inputImage}
                  isUploading={isUploading}
                  onUpload={() => setIsUploading(true)}
                ></UploadPanel>
                <PromptPanel
                  onChange={(e) => setPrompt(e.currentTarget.value)}
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
            <Button
              type="submit"
              className="rounded-full"
              size="lg"
              disabled={isGenerating || isUploading}
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
    </div>
  );
}
