import { useNavigate } from "@remix-run/react";
import pkg from "@material-tailwind/react";

const { Card, CardHeader, CardBody, Typography, CardFooter, Button } = pkg;

export interface PicCardProps {
  title: string;
  image: string;
  text: string;
  workflowName: string;
}

export function PicCard(props: PicCardProps) {
  const navigate = useNavigate();
  return (
    <Card
      className="max-w-[18rem] overflow-hidden cursor-pointer"
      onClick={() => {
        navigate(`/create?m=${props.workflowName}`);
      }}
    >
      <CardHeader
        floated={false}
        shadow={false}
        color="transparent"
        className="m-0 rounded-none"
      >
        <img src={props.image} alt="card-image" />
      </CardHeader>
      <CardBody>
        <Typography variant="h5" color="blue-gray" className="mb-2">
          {props.title}
        </Typography>
        <Typography className="montserrat-400">{props.text}</Typography>
      </CardBody>
      <CardFooter className="pt-0 flex place-content-center">
        <Button variant="text" className="rounded-full">
          Create
        </Button>
      </CardFooter>
    </Card>
  );
}
