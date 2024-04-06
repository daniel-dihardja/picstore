import pkg from "@material-tailwind/react";

const { Card, CardHeader, CardBody, Typography, CardFooter, Button } = pkg;

export interface PicProgressProps {
  percentage: number;
}

export function PicProgress() {
  return (
    <Card className="mb-4 flex items-center">
      <CardBody className="flex items-center justify-center h-full">
        <Button variant="text" loading={true}>
          Generating ...
        </Button>
      </CardBody>
    </Card>
  );
}
