import { Form, useSubmit } from "@remix-run/react";

import pkg from "@material-tailwind/react";
import { useRef } from "react";
const { Button } = pkg;

export interface UploadInputImage {
  action: string;
  image: string;
}

export function UploadPanel(props: UploadInputImage) {
  const hiddenFileInput = useRef(null);
  const submit = useSubmit();
  return (
    <div className=" bg-gray-200 h-full w-full rounded-md m-0 flex items-center justify-center">
      <Form
        action={props.action}
        method="POST"
        encType="multipart/form-data"
        className="flex place-content-center flex-col"
        onChange={(e) => submit(e.currentTarget)}
      >
        {props.image ? (
          <img
            src={`https://picstore.s3.eu-central-1.amazonaws.com/input/${props.image}`}
            className=" h-72"
          ></img>
        ) : null}

        <input
          name="file"
          type="file"
          style={{ display: "none" }}
          ref={hiddenFileInput}
        />
        <Button
          variant="text"
          onClick={() => {
            hiddenFileInput ? hiddenFileInput.current.click() : null;
          }}
        >
          Upload Image
        </Button>
      </Form>
    </div>
  );
}
