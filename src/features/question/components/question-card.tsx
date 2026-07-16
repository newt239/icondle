import { Card } from "@heroui/react";

type QuestionCardProps = {
  svgs: [string, string, string, string];
  answeredLabels: [string, string, string, string] | null;
};

export const QuestionCard = ({ svgs, answeredLabels }: QuestionCardProps) => (
  <Card className="items-center py-8">
    <div className="grid grid-cols-2 gap-6">
      {svgs.map((svg, index) => {
        const label = answeredLabels?.[index];
        const html =
          label === undefined
            ? svg
            : svg.replace(`aria-label="出題中のアイコン${index + 1}"`, `aria-label="${label}"`);
        return (
          <div
            className="size-20 sm:size-24 [&>svg]:size-full"
            dangerouslySetInnerHTML={{ __html: html }}
            key={`icon-${String(index)}`}
          />
        );
      })}
    </div>
  </Card>
);
