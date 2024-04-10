import type { MetaFunction } from "@remix-run/node";
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
      <div className="flex flex-col items-center min-h-screen text-gray-800 p-4">
        <h1 className="text-4xl font-bold mb-4 pt-12">Your Art, Simplified</h1>
        <p className="lg:text-2xl text-center mb-8 w-1/4">
          We're on a mission to democratize access to cutting-edge technology
          and change the way fantastic art is created.
        </p>
        <p className="lg:text-2xl text-center mb-8 w-1/4">
          Our platform leverages artificial intelligence to empower you, at any
          skill level, with the unique tool of making high-quality, print-ready
          images.
        </p>
        <p className="lg:text-2xl text-center mb-8 w-1/4">
          From mesmerizing fractals to stunning abstract pieces, the creative
          possibilities are endless!
        </p>
        <a
          href="/explore"
          className=" bg-black text-white font-bold py-2 px-4 rounded-full"
        >
          Get Started
        </a>
      </div>
    </div>
  );
}
