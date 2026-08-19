"use client";

import { useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Confirm",
  onConfirm,
}: {
  trigger: ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  return (
    <>
      <span onClick={() => ref.current?.showModal()}>{trigger}</span>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-xl border border-slate-200 bg-white p-0 shadow-xl backdrop:bg-slate-950/40"
      >
        <div className="p-5">
          <h2 id={titleId} className="font-semibold text-slate-950">
            {title}
          </h2>
          <p id={descriptionId} className="mt-2 text-sm text-slate-600">
            {description}
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="secondary" onClick={() => ref.current?.close()}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                onConfirm();
                ref.current?.close();
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </div>
      </dialog>
    </>
  );
}
