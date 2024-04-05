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
      <div className="flex flex-col items-center min-h-screen bg-gray-100 text-gray-800">
        <h1 className="text-4xl font-bold mb-4 pt-12">Picstore-Mocha</h1>
        <p className="text-2xl text-center mb-8 max-w-md">
          Generate stunning <strong>AI</strong> images, enhance prompts for
          unparalleled creativity, and transform ideas into{" "}
          <strong>print on demand</strong> artworks. Download your creations in
          high-quality, printable formats. Where <strong>imagination</strong>{" "}
          meets innovation — your next masterpiece awaits.
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
