import MT from "@material-tailwind/react";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
const { Button, Badge } = MT;

export default function ModelStatus() {
  const modelStatus = useFetcher();
  const [deployment, setDeployment] = useState(null);

  const colors = {
    ACTIVE: "green",
    DOWN: "red",
  };

  const fetchStatus = () => {
    return setInterval(async () => {
      const r = await fetch("/model/status");
      const d = await r.json();
      setDeployment(d);
      console.log({ deployment: d });
    }, 3000);
  };

  useEffect(() => {
    const i = fetchStatus();
    return () => clearInterval(i);
  }, []);

  return (
    <Badge color="green">
      <Button variant="outlined">Running</Button>
    </Badge>
  );
}
