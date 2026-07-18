import { buttonVariants, Kbd } from "@heroui/react";

type ChoiceListProps = {
  choices: [string, string, string, string];
  answers: string;
  nextFormAction: string;
  disabled: boolean;
  picked: number | null;
  answerIndex: number | null;
  onChoose: (index: number) => void;
};

export const ChoiceList = ({
  choices,
  answers,
  nextFormAction,
  disabled,
  picked,
  answerIndex,
  onChoose,
}: ChoiceListProps) => (
  <div aria-label="選択肢" className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group">
    {choices.map((choice, index) => (
      <form
        action={nextFormAction}
        key={choice}
        method="get"
        onSubmit={(event) => {
          event.preventDefault();
          onChoose(index);
        }}
      >
        <input name="a" type="hidden" value={`${answers}${index}`} />
        <button
          aria-keyshortcuts={String(index + 1)}
          className={`${buttonVariants({ fullWidth: true, variant: "secondary" })} justify-start gap-3 ${answerIndex === null ? "" : index === answerIndex ? "outline-success outline-2 outline-offset-2 outline-solid" : index === picked ? "outline-danger outline-2 outline-offset-2 outline-solid" : ""}`}
          disabled={disabled}
          type="submit"
        >
          <Kbd>{String(index + 1)}</Kbd>
          <span className="truncate">{choice}</span>
          {answerIndex !== null && index === answerIndex && <span aria-hidden="true">⭕</span>}
          {answerIndex !== null && index === picked && index !== answerIndex && (
            <span aria-hidden="true">❌</span>
          )}
        </button>
      </form>
    ))}
  </div>
);
