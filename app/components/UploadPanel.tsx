import { Form, useSubmit } from "@remix-run/react";

import pkg from "@material-tailwind/react";
import { useRef, useState } from "react";
const { Button } = pkg;

export interface UploadInputImage {
  action: string;
  image: string;
  isUploading: boolean;
  onUpload: (e: React.FormEvent<HTMLInputElement>) => void;
}

export function UploadPanel(props: UploadInputImage) {
  const hiddenFileInput = useRef(null);
  const submit = useSubmit();

  const upload = async (e: React.FormEvent<HTMLFormElement>) => {
    props.onUpload();
    submit(e.currentTarget);
  };

  return (
    <div className="sm:min-h-32 md:h-full w-full rounded-md m-0 flex items-center justify-center">
      <Form
        action={props.action}
        method="POST"
        encType="multipart/form-data"
        className="flex place-content-center flex-col h-full w-full "
        onChange={(e) => upload(e)}
      >
        <input
          name="file"
          type="file"
          style={{ display: "none" }}
          ref={hiddenFileInput}
        />
        <Button
          ripple={false}
          variant="text"
          className=" h-64 lg:h-96 w-full flex flex-row items-center justify-center bg-gray-100"
          onClick={
            !props.isUploading
              ? () => {
                  hiddenFileInput ? hiddenFileInput.current.click() : null;
                }
              : null
          }
        >
          <div className="flex flex-col place-content-center">
            {props.image ? (
              <img
                src={`https://picstore.s3.eu-central-1.amazonaws.com/input/${props.image}`}
                className=" h-44 lg:h-64"
              ></img>
            ) : null}
            <p className=" text-gray-400 mt-4 flex place-content-center">
              {props.isUploading ? (
                <Button size="sm" className="h-4" variant="text" loading={true}>
                  Loading
                </Button>
              ) : (
                <span>Click to upload</span>
              )}
            </p>
          </div>
        </Button>
      </Form>
    </div>
  );
}
