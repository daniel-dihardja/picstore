import { useLoaderData } from "@remix-run/react";
import { PicCard } from "~/components/PicCard";

export default function Explore() {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <PicCard
          title="Foundation"
          image="/img/cactus.png"
          text="
            Explore the foundation of artistic innovation, where the simplicity of a prompt or the essence of an image becomes the seed for generating captivating visuals. This intuitive approach allows for the seamless creation and transformation of artwork, blending the power of words and visuals with cutting-edge technology."
          workflowName="img2img"
        ></PicCard>
      </div>
    </div>
  );
}
