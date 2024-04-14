import MT from "@material-tailwind/react";
import { LoaderFunctionArgs, json, redirect } from "@remix-run/node";
import { Outlet, useLoaderData } from "@remix-run/react";
import { useState } from "react";
import { Header } from "~/components/Header";
const { Button, Card, CardBody } = MT;

import { getUserCredits } from "~/services";
import { authenticator } from "~/services/auth.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const user = await authenticator.isAuthenticated(request);
  if (!user) {
    throw redirect("/signin");
  }

  const credits = await getUserCredits(user.id);

  return json({ user, credits });
}

export default function Create() {
  const loaderData = useLoaderData<typeof loader>();
  const [credits] = useState(loaderData.credits || 0);
  const [user] = useState(loaderData.user);

  return (
    <>
      <Header credits={credits} user={user}></Header>
      <div className="container mx-auto px-4">
        <Outlet />
      </div>
    </>
  );
}
