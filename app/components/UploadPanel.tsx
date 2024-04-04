import { Form, useSubmit } from "@remix-run/react";

import pkg from "@material-tailwind/react";
import { useRef, useState } from "react";
const { Button } = pkg;

export interface UploadInputImage {
  action: string;
  image: string;
}

export function UploadPanel(props: UploadInputImage) {
  const hiddenFileInput = useRef(null);
  const submit = useSubmit();
  const [isUploading, setIsIsUploading] = useState(false);

  const upload = async (e: React.FormEvent<HTMLFormElement>) => {
    submit(e.currentTarget);
    setIsIsUploading(true);
  };

  return (
    <div className="h-full w-full rounded-md m-0 flex items-center justify-center">
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
          className="h-full w-full flex flex-row items-center justify-center bg-gray-100"
          onClick={
            !isUploading
              ? () => {
                  hiddenFileInput ? hiddenFileInput.current.click() : null;
                }
              : null
          }
        >
          {props.image ? (
            <div className="flex flex-col place-content-center">
              <img
                src={`https://picstore.s3.eu-central-1.amazonaws.com/input/${props.image}`}
                className="h-72"
              ></img>
              <p className=" text-gray-400 mt-4 flex place-content-center">
                {isUploading ? (
                  <Button
                    size="sm"
                    className="h-4"
                    variant="text"
                    loading={true}
                  >
                    Loading
                  </Button>
                ) : (
                  <span>Click to upload</span>
                )}
              </p>
            </div>
          ) : null}
        </Button>
      </Form>
    </div>
  );
}
