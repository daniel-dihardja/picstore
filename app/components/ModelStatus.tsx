import MT from "@material-tailwind/react";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { BehaviorSubject } from "rxjs";
const { Button, Badge } = MT;
import { Deployment } from "~/services/wakeup-api.server";

export const modelStatus$ = new BehaviorSubject<Deployment>({
  status: "SCALED_TO_ZERO",
});

export default function ModelStatus() {
  const [deployment, setDeployment] = useState(modelStatus$.value);

  const colors = {
    SCALED_TO_ZERO: "gray",
    WAKING_UP: "orange",
    ACTIVE: "green",
  };

  const fetchStatus = () => {
    const i = setInterval(async () => {
      const r = await fetch("/model/status");
      const d = await r.json();
      setDeployment(d);
      modelStatus$.next(d);
      if (d.status === "ACTIVE") {
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
    <Badge color={colors[deployment.status]}>
      <Button variant="outlined" loading={deployment.status === "WAKING_UP"}>
        {deployment.status === "SCALED_TO_ZERO" ? "Sleeping" : null}
        {deployment.status === "WAKING_UP" ? "Waking Up" : null}
        {deployment.status === "ACTIVE" ? "Active" : null}
      </Button>
    </Badge>
  );
}
