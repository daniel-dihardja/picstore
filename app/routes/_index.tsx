import type { MetaFunction } from "@remix-run/node";
import pkg from "@material-tailwind/react";
const {Button} = pkg;

export const meta: MetaFunction = () => {
  return [
    { title: "Style2Image" },
    { name: "description", content: "Lets create some artworks" },
  ];
};

export default function Index() {
  return (
    <div>
    <h1 className="text-3xl">{"Let's create some artworks"}</h1>
    <a href="create">Create</a>
    </div>
  )
}
