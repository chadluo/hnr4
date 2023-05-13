import styles from "@/styles/dialog.module.css";
import { IBM_Plex_Mono } from "next/font/google";
import { ForwardedRef, forwardRef, useEffect, useState } from "react";
import Comment from "./comment";

const monoFont = IBM_Plex_Mono({ subsets: ["latin"], weight: "400", style: "italic" });

type Props = {
  onClickClose: () => void;
  showKids: () => boolean;
  storyId: string;
  title: string;
  card: () => JSX.Element | undefined;
  longSummarization: string | undefined;
  kids: number[] | undefined;
};

const Dialog = forwardRef(function Dialog(props: Props, ref: ForwardedRef<HTMLDialogElement>) {
  const { onClickClose, showKids, storyId, title, card, longSummarization, kids } = props;

  const [startRender, setStartRender] = useState(showKids?.() || false);
  useEffect(() => {
    setStartRender(showKids());
  }, [showKids]);

  return (
    <dialog className={`${styles.dialog} ${kids ? styles.wideDialog : ""}`} ref={ref}>
      <a onClick={onClickClose}>❌</a>
      <div className={styles.dialogContent}>
        <div className={styles.story}>
          <a href={`https://news.ycombinator.com/item?id=${storyId}`} className={styles.hnTitle} target="_blank">
            {title}
          </a>
          {card?.()}
          <span className={`${monoFont.className} ${styles.longSummarization}`}>{longSummarization}</span>
        </div>
        {startRender && (
          <div className={styles.comments}>
            {kids?.map((kid) => (
              <Comment key={kid} commentId={kid.toString()} expand={false} />
            ))}
          </div>
        )}
      </div>
    </dialog>
  );
});

export default Dialog;
