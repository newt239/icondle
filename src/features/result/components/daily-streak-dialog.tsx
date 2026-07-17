import {
  Button,
  ModalBackdrop,
  ModalBody,
  ModalContainer,
  ModalDialog,
  ModalFooter,
  ModalHeader,
  ModalHeading,
  ModalRoot,
} from "@heroui/react";

type DailyStreakDialogProps = {
  onOpenChange: (isOpen: boolean) => void;
  streakDays: number;
};

export const DailyStreakDialog = ({ onOpenChange, streakDays }: DailyStreakDialogProps) => (
  <ModalRoot isOpen onOpenChange={onOpenChange}>
    <ModalBackdrop>
      <ModalContainer>
        <ModalDialog>
          <ModalHeader>
            <ModalHeading>{streakDays} Days Streak</ModalHeading>
          </ModalHeader>
          <ModalBody>
            <p>Icondle Dailyに{streakDays}日連続でチャレンジしています🎉 ありがとうございます！</p>
          </ModalBody>
          <ModalFooter>
            <Button slot="close" variant="primary">
              閉じる
            </Button>
          </ModalFooter>
        </ModalDialog>
      </ModalContainer>
    </ModalBackdrop>
  </ModalRoot>
);
