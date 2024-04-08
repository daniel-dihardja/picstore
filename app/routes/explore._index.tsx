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
