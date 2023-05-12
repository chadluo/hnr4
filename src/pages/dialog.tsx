import styles from "@/styles/dialog.module.css";
import { IBM_Plex_Mono } from "next/font/google";
import { ForwardedRef, forwardRef } from "react";

const monoFont = IBM_Plex_Mono({ subsets: ["latin"], weight: "400", style: "italic" });

type Props = {
  title: string;
  card: () => JSX.Element | undefined;
  longSummarization: string | undefined;
  onClickClose: () => void;
};

const Dialog = forwardRef(function Dialog(props: Props, ref: ForwardedRef<HTMLDialogElement>) {
  const { title, card, longSummarization, onClickClose } = props;

  return (
    <dialog className={styles.dialog} ref={ref}>
      <a onClick={onClickClose}>❌</a>
      {title}
      {card?.()}
      <span className={`${monoFont.className} ${styles.longSummarization}`}>{longSummarization}</span>
    </dialog>
  );
});

export default Dialog;
