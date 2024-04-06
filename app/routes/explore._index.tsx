import { Header } from "~/components/Header";
import { PicCard } from "~/components/PicCard";

export default function Styles() {
  return (
    <div>
      <Header></Header>
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-columns-1 md:grid-columns-2 lg:grid-columns-3 gap-0 mt-12">
          <div className="flex place-content-center mb-6">
            <PicCard
              title="Image Evolution"
              image="/img/img2img.webp"
              text="
              Dive into the mesmerizing world of image evolution. With the power of our GPT Prompt Enhancer, embark on an endless journey of artistic innovation."
              workflowName="img2img"
            ></PicCard>
          </div>
        </div>
      </div>
    </div>
  );
}
