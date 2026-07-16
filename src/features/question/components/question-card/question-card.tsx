import { Card } from "@heroui/react";

type QuestionCardProps = {
  svg: string;
  answeredLabel: string | null;
};

export const QuestionCard = ({ svg, answeredLabel }: QuestionCardProps) => {
  const html =
    answeredLabel === null
      ? svg
      : svg.replace('aria-label="出題中のアイコン"', `aria-label="${answeredLabel}"`);
  return (
    <Card className="items-center py-10">
      <div
        className="size-32 text-neutral-900 sm:size-40 dark:text-neutral-100 [&>svg]:size-full"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </Card>
  );
};
