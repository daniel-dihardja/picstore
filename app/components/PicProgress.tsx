import pkg from "@material-tailwind/react";

const { Card, CardHeader, CardBody, Typography, CardFooter, Button } = pkg;

export interface PicProgressProps {
  percentage: number;
}

export function PicProgress(props: PicProgressProps) {
  return (
    <Card className="pb-4">
      <CardHeader floated={false} shadow={false}>
        <div
          style={{ width: "220px", height: "220px" }}
          className="flex place-content-center pt-20"
        >
          <h3 className="text-4xl">{props.percentage} %</h3>
        </div>
      </CardHeader>
    </Card>
  );
}
