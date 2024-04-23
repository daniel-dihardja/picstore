import { useLoaderData } from "@remix-run/react";
import { PicCard } from "~/components/PicCard";

export default function Explore() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PicCard
          title="Test"
          image="/img/cactus.png"
          text="A module designed to test the upload and prompt functionality, ensuring that ComfyUI correctly receives and processes the data."
          workflowName="img2img"
        ></PicCard>
      </div>
    </div>
  );
}
