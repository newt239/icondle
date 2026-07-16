import { buttonVariants, Kbd } from "@heroui/react";

type PickChoiceListProps = {
  svgs: [string, string, string, string];
  answers: string;
  nextFormAction: string;
  disabled: boolean;
  picked: number | null;
  answerIndex: number | null;
  answeredLabel: string | null;
  onChoose: (index: number) => void;
};

const stateClassName = (
  index: number,
  picked: number | null,
  answerIndex: number | null,
): string => {
  if (answerIndex === null) {
    return "";
  }
  if (index === answerIndex) {
    return "outline-2 outline-offset-2 outline-solid outline-success";
  }
  if (index === picked) {
    return "outline-2 outline-offset-2 outline-solid outline-danger";
  }
  return "";
};

export const PickChoiceList = ({
  svgs,
  answers,
  nextFormAction,
  disabled,
  picked,
  answerIndex,
  answeredLabel,
  onChoose,
}: PickChoiceListProps) => (
  <div aria-label="選択肢" className="grid grid-cols-2 gap-3" role="group">
    {svgs.map((svg, index) => {
      const html =
        answeredLabel !== null && index === answerIndex
          ? svg.replace(
              `aria-label="選択肢${index + 1}のアイコン"`,
              `aria-label="${answeredLabel}"`,
            )
          : svg;
      return (
        <form
          action={nextFormAction}
          key={`choice-${String(index)}`}
          method="get"
          onSubmit={(event) => {
            event.preventDefault();
            onChoose(index);
          }}
        >
          <input name="a" type="hidden" value={`${answers}${index}`} />
          <button
            aria-keyshortcuts={String(index + 1)}
            className={`${buttonVariants({ fullWidth: true, variant: "secondary" })} h-auto flex-col gap-2 py-4 ${stateClassName(index, picked, answerIndex)}`}
            disabled={disabled}
            type="submit"
          >
            <span className="flex items-center gap-2">
              <Kbd>{String(index + 1)}</Kbd>
              {answerIndex !== null && index === answerIndex && <span aria-hidden="true">⭕</span>}
              {answerIndex !== null && index === picked && index !== answerIndex && (
                <span aria-hidden="true">❌</span>
              )}
            </span>
            <span
              className="block size-16 sm:size-20 [&>svg]:size-full"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </button>
        </form>
      );
    })}
  </div>
);
