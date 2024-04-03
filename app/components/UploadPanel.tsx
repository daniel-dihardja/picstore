import { Form } from "@remix-run/react";

export interface UploadPanelProps {
  action: string;
}

export function UploadPanel(props: UploadPanelProps) {
  return (
    <div className=" bg-gray-200 h-full w-full rounded-md m-0 flex items-center justify-center">
      <Form action={props.action} method="POST" encType="multipart/form-data">
        <p>Drop image or click to upload</p>
        <label>
          <input name="file" type="file" />
        </label>
        <button type="submit">Upload</button>
      </Form>
    </div>
  );
}
