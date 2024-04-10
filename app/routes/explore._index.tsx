import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { l } from "node_modules/vite/dist/node/types.d-aGj9QkWt";
import { useEffect, useState } from "react";
import { Header } from "~/components/Header";
import { PicCard } from "~/components/PicCard";
import { getUser, getUserCredits } from "~/services";
import { authenticator } from "~/services/auth.server";

export const loader = async ({ request }) => {
  const user = await authenticator.isAuthenticated(request);
  if (user) {
    const credits = await getUserCredits(user.id);
    return json({ user, credits });
  }
  return json({ user: null, credits: 0 });
};

export default function Explore() {
  const loaderData = useLoaderData<typeof loader>();
  const [credits, setCredits] = useState(loaderData.credits || 0);
  const [user] = useState(loaderData.user);

  useEffect(() => {
    if (loaderData) {
      const { credits } = loaderData;
      credits ? setCredits(credits) : null;
    }
  }, [loaderData]);
  return (
    <div>
      <Header credits={credits} user={user}></Header>
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <PicCard
            title="Foundation"
            image="/img/hidden-face.webp"
            text="
            Explore the foundation of artistic innovation, where the simplicity of a prompt or the essence of an image becomes the seed for generating captivating visuals. This intuitive approach allows for the seamless creation and transformation of artwork, blending the power of words and visuals with cutting-edge technology."
            workflowName="img2img"
          ></PicCard>
        </div>
      </div>
    </div>
  );
}
