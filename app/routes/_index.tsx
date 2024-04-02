import type { MetaFunction } from "@remix-run/node";
import { Header } from "~/components/Header";

export const meta: MetaFunction = () => {
  return [
    { title: "Style2Image" },
    { name: "description", content: "Lets create some artworks" },
  ];
};

export default function Index() {
  return (
    <div className="container mx-auto px-4 py-4">
      <Header></Header>
    </div>
  );
}
