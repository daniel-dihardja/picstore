import { Header } from "~/components/Header";
import { PicCard } from "~/components/PicCard";

export default function Styles() {
  return (
    <div>
      <Header></Header>
      <div className="container mx-auto px-4 py-4">
        <div className="columns-3 gap-0 mt-12">
          <div className="flex place-content-center mb-6">
            <PicCard
              title="Test img2img"
              image="/img/bg-03.avif"
              text="Development is a process of continuous improvement."
              workflowName="workflow_img2img_api"
            ></PicCard>
          </div>
          <div className="flex place-content-center mb-6">
            <PicCard
              title="Background remover"
              image="/img/bg-remover.webp"
              text="Remove the background from your images."
              workflowName="bottle"
            ></PicCard>
          </div>
          <div className="flex place-content-center mb-6">
            <PicCard
              title="Colorize"
              image="/img/colorize.jpeg"
              text="Remove the background from your images."
              workflowName="bottle"
            ></PicCard>
          </div>
        </div>
      </div>
    </div>
  );
}
