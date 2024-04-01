import {
  ActionFunctionArgs,
  json,
  unstable_parseMultipartFormData,
} from "@remix-run/node";
import { s3UploaderHandler } from "../.server/uploadToS3";
import { Form, useFetcher, useSubmit } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Header } from "~/components/Header";
import MT from "@material-tailwind/react";
const { Button } = MT;

import { style2image, defaultWorkflow } from "~/.server/workflows";
import { queuePrompt } from "~/.server/comfyui";

// export async function action({ request }: ActionFunctionArgs) {
//   const formData = await unstable_parseMultipartFormData(
//     request,
//     s3UploaderHandler
//   );

//   const files = formData.getAll("file");

//   return json({
//     files: files.map((file) => ({
//       name: file,
//       url: `https://picstore.s3.eu-central-1.amazonaws.com/${file}`,
//     })),
//   });
// }

export async function action({ request }: ActionFunctionArgs) {
  const res = await queuePrompt(
    "default.json",
    "style2image",
    "http://127.0.0.1:8188"
  );

  console.log(res);

  return json({});
}

export default function Create() {
  //const { submit, isUploading, images } = useFileUpload();
  const submit = useSubmit();

  return (
    <main>
      <Header></Header>

      <div className="container mx-auto px-4 py-4">
        <div className="columns-2 gap-4">
          <div
            // style={{ border: "1px solid" }}
            className="flex place-content-end"
          >
            <Image name="test" url="http://localhost:3000/img/bg-03.avif" />
          </div>
          <div
            // style={{ border: "1px solid" }}
            className="flex place-content-left"
          >
            <Image name="test" url="http://localhost:3000/img/bg-03.avif" />
          </div>
        </div>
        <div className="columns-1 flex place-content-center mt-20">
          <Form action="/create" method="POST">
            <Button type="submit">Generate</Button>
          </Form>
        </div>

        {/*
         * Here we render the list of images including the ones we're uploading
         * and the ones we've already uploaded
         */}
        {/* {images.map((file) => {
            return <Image key={file.name} name={file.name} url={file.url} />;
          })} */}

        {/* <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          {isUploading ? <p>Uploading...</p> : <p>Select an image</p>}
          <input
            onChange={(event) => submit(event.currentTarget.files)}
            className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400"
            type="file"
          ></input>
        </label> */}
      </div>
    </main>
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
