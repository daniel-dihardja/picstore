import MT from "@material-tailwind/react";
import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";
import { Deployment } from "~/services/wakeup-api.server";
const { Button, Badge } = MT;

export const modelStatus$ = new BehaviorSubject<Deployment>({
  status: "SCALED_TO_ZERO",
});

export default function ModelStatus() {
  const [comfyUiApiStatus, setComfyUiApiStatus] = useState(modelStatus$.value);

  const colors = {
    SCALED_TO_ZERO: "gray",
    WAKING_UP: "orange",
    ACTIVE: "green",
  };

  const fetchStatus = () => {
    const i = setInterval(async () => {
      const r = await fetch("/model/status");
      const d = await r.json();
      setComfyUiApiStatus(d);
      modelStatus$.next(d);
      if (d.available) {
        clearInterval(i);
        modelStatus$.complete();
      }
    }, 3000);
    return i;
  };

  useEffect(() => {
    const i = fetchStatus();
    return () => clearInterval(i);
  }, []);

  return (
    <Badge
      color={colors[comfyUiApiStatus.available ? "ACTIVE" : "SCALED_TO_ZERO"]}
    >
      <Button variant="outlined" loading={!comfyUiApiStatus.available}>
        {comfyUiApiStatus.available ? "Active" : null}
      </Button>
    </Badge>
  );
}
