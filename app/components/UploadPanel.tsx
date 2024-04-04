import { Form } from "@remix-run/react";

export interface UploadInputImage {
  action: string;
  image: string;
}

export function UploadPanel(props: UploadInputImage) {
  return (
    <div className=" bg-gray-200 h-full w-full rounded-md m-0 flex items-center justify-center">
      <Form action={props.action} method="POST" encType="multipart/form-data">
        {props.image ? (
          <img
            src={`https://picstore.s3.eu-central-1.amazonaws.com/input/${props.image}`}
            className=" h-72"
          ></img>
        ) : (
          <p>Drop image or click to upload</p>
        )}
        <label>
          <input name="file" type="file" />
        </label>
        <button type="submit">Upload</button>
      </Form>
    </div>
  );
}
