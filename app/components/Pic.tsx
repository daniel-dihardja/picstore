import pkg from "@material-tailwind/react";

const { Card, CardHeader, CardBody, Typography, CardFooter, Button } = pkg;

export interface PicProps {
  url: string;
}
export function Pic(props: PicProps) {
  return (
    <Card className="mb-4">
      <CardBody className="flex place-content-center">
        <img src={props.url} alt="card-image" width="250" />
      </CardBody>
    </Card>
  );
}
