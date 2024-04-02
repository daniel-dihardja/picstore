import pkg from "@material-tailwind/react";

const { Card, CardHeader, CardBody, Typography, CardFooter, Button } = pkg;

export interface PicProps {
  url: string;
}
export function Pic(props: PicProps) {
  return (
    <Card className="mb-4">
      <CardBody className="flex flex-col place-content-center">
        <img src={props.url} alt="card-image" width="250" />
        <br />
        <a href="">Download large-2x ... 2 Credits</a>
        <a href="">Download large-4x ... 3 Credits</a>
        <a href="">Download large-8x ... 4 Credits</a>
      </CardBody>
    </Card>
  );
}
