import pkg from "@material-tailwind/react";

const { Card, CardHeader, CardBody, Typography, CardFooter, Button } = pkg;

export interface PicProps {
  url: string;
}
export function Pic(props: PicProps) {
  return (
    <Card className="mb-4 ">
      <CardBody className="flex flex-col place-content-center p-4 min-h-15">
        <img src={props.url} alt="card-image" className="w-full" />
      </CardBody>
    </Card>
  );
}
