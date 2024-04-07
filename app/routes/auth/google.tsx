import { ActionArgs } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export let loader = () => redirect("/signin");

export let action = ({ request }: ActionArgs) => {
  return authenticator.authenticate("google", request);
};
