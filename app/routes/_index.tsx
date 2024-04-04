import type { MetaFunction } from "@remix-run/node";
import { Outlet } from "@remix-run/react";
import { Header } from "~/components/Header";

export const meta: MetaFunction = () => {
  return [
    { title: "Picstore Mocha" },
    { name: "description", content: "Lets create some artworks" },
  ];
};

export default function Index() {
  return (
    <div>
      <Header></Header>
    </div>
  );
}
