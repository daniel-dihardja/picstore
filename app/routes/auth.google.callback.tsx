import { LoaderArgs } from "@remix-run/node";
import { authenticator } from "~/services/auth.server";

export const loader = ({ request }: LoaderArgs) => {
  return authenticator.authenticate("google", request, {
    successRedirect: "/explore",
    failureRedirect: "/signin",
  });
};

export default function Callback() {
  return null;
}
