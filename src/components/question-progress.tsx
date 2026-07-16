import { ProgressBar } from "@heroui/react";

type QuestionProgressProps = {
  n: number;
  total: number;
};

export const QuestionProgress = ({ n, total }: QuestionProgressProps) => (
  <ProgressBar aria-label={`全${total}問中${n}問目`} maxValue={total} minValue={0} value={n}>
    <ProgressBar.Track>
      <ProgressBar.Fill />
    </ProgressBar.Track>
  </ProgressBar>
);
