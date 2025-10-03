"use client";
import { User } from "@supabase/supabase-js";
import React, { Fragment, useRef, useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { useRouter } from "next/navigation";
import "@/styles/ai-response.css";
import { summarizeNoteAction } from "@/actions/ai";

type Props = {
  user: User | null;
  noteId: string;
};

function SummarizeButton({ user, noteId }: Props) {
  const [isPending, startTransition] = useTransition();

  const [open, setOpen] = useState(false);
  const [summary, setSummary] = useState<string>("");

  const router = useRouter();
  const contentRef = useRef<HTMLDivElement>(null);

  const handleOnOpenChange = (isOpen: boolean) => {
    if (!user) {
      router.push("/login");
    } else {
      if (isOpen) {
        setSummary("");
        startTransition(async () => {
            const response = await summarizeNoteAction(noteId);
            setSummary(response);
        });
      }
      setOpen(isOpen);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOnOpenChange}>
      <DialogTrigger asChild>
        <Button 
    className='p-5 hover:scale-110 transition-transform hover:bg-[oklch(0.76 0.007 247.896)] dark:hover:bg-[oklch(0.26_0.02_262.13)]'
        variant="secondary">Summarize</Button>
      </DialogTrigger>
      <DialogContent
        className="custom-scrollbar flex h-[85vh] max-w-4xl flex-col overflow-y-auto"
        ref={contentRef}
      >
        <DialogHeader>
          <DialogTitle>Summarize Your Notes</DialogTitle>
          <DialogDescription>
            Our AI is summarizing your notes for you.
          </DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-col gap-8">
          {isPending ? (
            <p className="animate-pulse text-sm">Summarizing...</p>
          ) : (
            summary && (
              <p
                className="bot-response text-muted-foreground text-sm"
                dangerouslySetInnerHTML={{ __html: summary }}
              />
            )
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SummarizeButton;
