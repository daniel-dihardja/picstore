import { Form } from "@remix-run/react";
import MT from "@material-tailwind/react";
import { Header } from "~/components/Header";
import { authenticator } from "~/services/auth.server";
import { ActionFunctionArgs } from "@remix-run/node";
const { Button } = MT;

export async function action({ request }: ActionFunctionArgs) {
  return authenticator.authenticate("google", request);
}

export default function Login() {
  return (
    <>
      <Header />
      <div className="container flex place-content-center mx-auto w-full p-4">
        <Form action="/signin" method="post">
          <Button type="submit">Login with Google</Button>
        </Form>
      </div>
    </>
  );
}
