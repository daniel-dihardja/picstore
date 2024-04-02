import pkg from "@material-tailwind/react";

const { Card, CardHeader, CardBody, Typography, CardFooter, Button } = pkg;

export interface PicProgressProps {
  percentage: number;
}

export function PicProgress(props: PicProgressProps) {
  return (
    <Card className="mb-4">
      <CardHeader floated={false} shadow={false}>
        <div className="flex place-content-center pt-20">
          <h3 className="text-4xl">{props.percentage} %</h3>
        </div>
        <div className="flex place-content-center pt-4">
          <p className="text-xs">Generating image</p>
        </div>
      </CardHeader>
    </Card>
  );
}
