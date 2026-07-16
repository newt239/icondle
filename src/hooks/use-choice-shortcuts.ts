import { useEffect } from "react";

export const useChoiceShortcuts = (onChoose: (index: number) => void): void => {
  useEffect(() => {
    // グローバルな keydown リスナーの登録と解除はブラウザ API 操作のため useEffect が必要
    const handler = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const index = ["1", "2", "3", "4"].indexOf(event.key);
      if (index !== -1) {
        onChoose(index);
      }
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [onChoose]);
};
