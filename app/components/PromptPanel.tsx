import { useState } from "react";

export interface PromptPanelProps {
  onChange: (e: string) => void;
}

const items = [
  {
    name: "Lighting",
    options: [
      "golden hour, warm glow",
      "blue hour, twilight, ISO12000",
      "midday, direct lighting, overhead sunlight",
      "overcast, whitebox, flat lighting, diffuse",
      "dreamlike diffuse ethereal lighting",
      "dramatic lighting, dramatic shadows, illumination",
      "studio lighting, professional lighting, well-lit",
      "flash photography",
      "low-key lighting, dimly lit",
      "high-key lighting, neutral, flat, even, ambient light",
    ],
  },
  {
    name: "Angle & framing",
    options: [
      "extreme close-up",
      "close-up",
      "medium shot, waist and torso shot",
      "long shot, wide shot, full body",
      "extreme long shot, extreme wide shot, from a distance",
      "high overhead view, establishing shot, long drone shot",
      "low angle, imposing, from below",
      "satellite photography, bird's eye view, Google Maps Satellite view, (c) Planet Labs",
    ],
  },
  {
    name: "Lens & Capture",
    options: [
      "Fast shutter speed, 1/1000 sec shutter",
      "Slow shutter speed, long exposure",
      "bokeh, shallow depth of field, background blur",
      "tilt shift photography",
      "motion blur, fast motion capture",
      "macro lens, macro photo, Sigma 105mm f/2.8",
      "wide angle lens, 15mm, ultra-wide shot",
    ],
  },
  {
    name: "Film selection",
    options: [
      "Kodachrome",
      "Autochrome",
      "Polaroid scan, Instax scan",
      "cameraphone 2007",
      "Camera obscura, pinhole photography",
      "double exposure, award-winning photograph",
      "black and white, tri-x 400TX",
      "bleach bypass",
      "color splash",
      "Instagram, Hipstamatic, 2015",
    ],
  },
  {
    name: "Specific film & TV",
    options: [
      "from TV show Friends, Season 3",
      "from The Grand Budapest Hotel, Wes Anderson",
      "from Blade Runner 2049",
      'from film "Interstellar"',
      'from film "The Matrix", 1999',
      "by Simon Stålenhag",
    ],
  },
  {
    name: "Art style",
    options: [
      "American newspaper political cartoon sketch, black and white New Yorker cartoon",
      "woodcut painting",
      "charcoal sketch",
      "watercolor",
      "acrylic on canvas",
      "colored pencil, detailed",
      "oil painting",
      "airbrush",
      "Chinese watercolor painting",
      "vector graphics, clipart",
      "watercolor & pen",
      "digital painting",
      "layered paper",
      "low poly, unreal engine, Blender render",
      "isometric 3D, highest quality render",
      "Houdini 3D, Octane render, ZBrush, Blender, highest quality 3D render",
      "claymation",
      "still from Pixar animated short",
      "still from film by Studio Ghibli, Hayao Miyazaki",
      "Renaissance painting, neoclassical, Renoir",
      "Impressionism, Monet, Van Gogh",
      "Rococo, 1730, late Baroque",
      "Art deco, vintage, moderne",
      "Bauhaus, postwar midcentury style, Wassily Kandinsky",
      "surrealist, Magritte, Salvador Dali",
      "urban street photography",
      "Thomas Kinkade",
      "papercraft, origami, highly detailed",
    ],
  },
  {
    name: "Vibes",
    options: [
      "vaporwave, neon, 80s",
      "post-apocalyptic",
      "gothic, fantasy, lush, mystery",
      "cybernetic, sci-fi, Matrix, glowing",
      "steampunk, metallic, Victoriana",
      "Memphis style, Memphis group, bold, kitch, colorful, geometric",
      "Dieselpunk, grimy, steel, industrial",
      "Afrofuturism, lush, solarpunk",
      "cyberpunk, 90s, graphic",
      "organic, lush, solarpunk, green, sustainable",
    ],
  },
  {
    name: "Mood",
    options: [
      "light, peaceful, calm, serene, soothing, relaxed, ethereal, delicate",
      "bright, vibrant, dynamic, energetic, vivid, rich, saturated, exciting",
      "muted, bleak, somber, melancholic, gloomy, sad, desaturated, dull, dim",
      "dark, ominous, haunting, forboding, gloomy, stormy, sinister, shadowy, harrowing",
    ],
  },
  {
    name: "Scale",
    options: [
      "grand, high-scale, monumental, imposing, manmade, superstructure, perspective",
      "ornate, delicate, precise, opulent, elegant, ornamental, fine, intricate, decorative",
      "microscopic, tiny, invisible",
    ],
  },
  // Add other items here
];
export function PromptPanel(props: PromptPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedItem, setSelectedItem] = useState(items[0].name);
  const [options, setOptions] = useState(items[0].options);

  const handleSelectChange = (event) => {
    const selectedItemName = event.target.value;
    setSelectedItem(selectedItemName);
    const selectedOptions =
      items.find((item) => item.name === selectedItemName)?.options || [];
    setOptions(selectedOptions);
  };

  const appendPrompt = (e) => {
    const p = `${prompt ? prompt + ", " : ""}${e.currentTarget.value}`;
    setPrompt(p);
    props.onChange(p);
  };

  const updatePrompt = (e) => {
    const p = e.currentTarget.value;
    setPrompt(p);
    props.onChange(p);
  };

  return (
    <div className="h-full w-full">
      <textarea
        className="w-full h-1/2 p-4 text-lg text-gray-800  border border-gray-300 rounded-md"
        placeholder="Enter your prompt here"
        onChange={(e) => updatePrompt(e)}
        value={prompt}
      ></textarea>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <select
          value={selectedItem}
          onChange={handleSelectChange}
          className="border border-gray-300 rounded-md p-2"
        >
          {items.map((item) => (
            <option key={item.name} value={item.name}>
              {item.name}
            </option>
          ))}
        </select>

        <select
          className="border border-gray-300 rounded-md p-2"
          onChange={(e) => appendPrompt(e)}
        >
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
