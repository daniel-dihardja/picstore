import { useFetcher } from "@remix-run/react";
import { useRef, useEffect } from "react";
import pkg from "@material-tailwind/react";
import { User } from "~/types";
const { Button } = pkg;

export interface UploadPanelProps {
  user: User;
  onUploading: () => void;
  onUploadComplete: (res: UploadResponse) => void;
}

export interface UploadResponse {
  image: string;
}

export function UploadPanel({
  user,
  onUploading,
  onUploadComplete,
}: UploadPanelProps) {
  const hiddenFileInput = useRef<HTMLInputElement>(null);
  const fetcher = useFetcher<UploadResponse>();

  // Handles the file input change event and submits the form
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    onUploading();
    const formData = new FormData();
    formData.append("file", files[0]);

    fetcher.submit(formData, {
      action: `/users/${user.id}/upload`,
      method: "post",
      encType: "multipart/form-data",
    });
  };

  // Triggers the hidden file input click
  const triggerFileInputClick = () => {
    if (fetcher.state === "idle" && hiddenFileInput.current) {
      hiddenFileInput.current.click();
    }
  };

  // Effect to handle when the upload is complete
  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      onUploadComplete(fetcher.data);
    }
  }, [fetcher.data, fetcher.state, onUploadComplete]);

  return (
    <div className="sm:min-h-32 md:h-full w-full rounded-md m-0 flex items-center justify-center">
      <fetcher.Form
        action={`/users/${user.id}/upload`}
        method="POST"
        encType="multipart/form-data"
        className="flex place-content-center flex-col h-full w-full"
      >
        <input
          name="file"
          type="file"
          className="hidden"
          ref={hiddenFileInput}
          onChange={handleFileChange}
        />
        <Button
          ripple={false}
          variant="text"
          className="h-64 lg:h-96 w-full flex flex-row items-center justify-center bg-gray-100"
          onClick={triggerFileInputClick}
          disabled={fetcher.state !== "idle"}
        >
          <div className="flex flex-col place-content-center">
            {fetcher.data?.image && (
              <img
                src={`https://picstore.s3.eu-central-1.amazonaws.com/${fetcher.data.image}`}
                className="h-44 lg:h-64"
                alt="Uploaded image"
              />
            )}
            <p className="text-gray-400 mt-4 flex justify-center">
              {fetcher.state === "submitting"
                ? "Loading..."
                : "Click to upload"}
            </p>
          </div>
        </Button>
      </fetcher.Form>
    </div>
  );
}
