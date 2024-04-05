export interface PromptPanelProps {
  prompt: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}
export function PromptPanel(props: PromptPanelProps) {
  return (
    <div className="h-full w-full">
      <textarea
        className="w-full h-full p-4 text-lg text-gray-800  border border-gray-300 rounded-md"
        placeholder="Enter your prompt here"
        onChange={props.onChange}
        value={props.prompt}
      ></textarea>
    </div>
  );
}
