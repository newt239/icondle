import { buttonVariants, Kbd } from "@heroui/react";

import type { PickChoiceSvgs } from "#/types";

type PickChoiceListProps = {
  choices: [PickChoiceSvgs, PickChoiceSvgs, PickChoiceSvgs, PickChoiceSvgs];
  answers: string;
  nextFormAction: string;
  disabled: boolean;
  picked: number | null;
  answerIndex: number | null;
  answeredLabels: [string, string, string, string] | null;
  choiceLabels: [string, string, string, string] | null;
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
  choices,
  answers,
  nextFormAction,
  disabled,
  picked,
  answerIndex,
  answeredLabels,
  choiceLabels,
  onChoose,
}: PickChoiceListProps) => (
  <div aria-label="選択肢" className="grid grid-cols-2 gap-3" role="group">
    {choices.map((svgs, index) => (
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
          <span className="grid grid-cols-2 gap-2">
            {svgs.map((svg, iconIndex) => {
              const label = index === answerIndex ? answeredLabels?.[iconIndex] : undefined;
              const html =
                label === undefined
                  ? svg
                  : svg.replace(
                      `aria-label="選択肢${index + 1}のアイコン${iconIndex + 1}"`,
                      `aria-label="${label}"`,
                    );
              return (
                <span
                  className="block size-10 sm:size-12 [&>svg]:size-full"
                  dangerouslySetInnerHTML={{ __html: html }}
                  key={`icon-${String(iconIndex)}`}
                />
              );
            })}
          </span>
          <span className="block h-4 w-full truncate text-center text-xs">
            {choiceLabels?.[index]}
          </span>
        </button>
      </form>
    ))}
  </div>
);
