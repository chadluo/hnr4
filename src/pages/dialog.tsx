import styles from "@/styles/dialog.module.css";
import { ForwardedRef, forwardRef } from "react";

type Props = {
  title: string;
  card: () => JSX.Element | undefined;
  description: string | undefined;
  onClickClose: () => void;
};

const Dialog = forwardRef(function Dialog(props: Props, ref: ForwardedRef<HTMLDialogElement>) {
  const { title, card, description, onClickClose } = props;

  return (
    <dialog className={styles.dialog} ref={ref}>
      <a onClick={onClickClose}>❌</a>
      {title}
      {card()}
      {description}
    </dialog>
  );
});

export default Dialog;
