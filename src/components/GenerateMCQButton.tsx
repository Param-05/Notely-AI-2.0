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
import { generateMCQsAction } from "@/actions/ai";
import "@/styles/ai-response.css";

type Props = {
  user: User | null;
  noteId: string;
};

export default function GenerateMCQButton({ user, noteId }: Props) {
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [mcqBatches, setMcqBatches] = useState<string[]>([]);
  const [previousQuestions, setPreviousQuestions] = useState<string[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleOnOpenChange = (isOpen: boolean) => {
    if (!user) {
      router.push("/login");
    } else {
      if (isOpen && mcqBatches.length === 0) {
        // Generate first batch
        startTransition(async () => {
          const result = await generateMCQsAction(noteId, []);
          const extractedQuestions = extractQuestions(result);
          setPreviousQuestions(extractedQuestions);
          setMcqBatches([result]);
        });
      }
      setOpen(isOpen);
    }
  };

  const handleGenerateMore = async () => {
    startTransition(async () => {
      const result = await generateMCQsAction(noteId, previousQuestions);
      const extractedQuestions = extractQuestions(result);
      setPreviousQuestions((prev) => [...prev, ...extractedQuestions]);
      setMcqBatches((prev) => [...prev, result]);
      setTimeout(() => {
        contentRef.current?.scrollTo({
          top: contentRef.current.scrollHeight,
          behavior: "smooth",
        });
      }, 100);
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOnOpenChange}>
      <DialogTrigger asChild>
        <Button 
    className='p-5 hover:scale-110 transition-transform hover:bg-[oklch(0.76 0.007 247.896)] dark:hover:bg-[oklch(0.26_0.02_262.13)]'
         variant="secondary">Generate MCQs</Button>
      </DialogTrigger>

      <DialogContent
        className="custom-scrollbar flex h-[85vh] max-w-4xl flex-col overflow-y-auto"
        ref={contentRef}
      >
        <DialogHeader>
          <DialogTitle>MCQs from Your Note</DialogTitle>
          <DialogDescription>
            Our AI is generating multiple choice questions based on your note.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 flex flex-col gap-8">
          {mcqBatches.map((mcq, i) => (
            <Fragment key={i}>
              <p className="ml-auto max-w-[60%] rounded-md bg-muted px-2 py-1 text-sm text-muted-foreground">
                Generate 10 MCQs (Batch {i + 1})
              </p>
              <p
                className="bot-response text-sm text-muted-foreground"
                dangerouslySetInnerHTML={{ __html: mcq }}
              />
            </Fragment>
          ))}
          {isPending && <p className="animate-pulse text-sm">Generating more MCQs...</p>}
        </div>

        <div className="mt-auto w-full">
          <Button
            onClick={handleGenerateMore}
            disabled={isPending}
            className="w-full mt-4"
            variant="outline"
          >
            {isPending ? "Loading..." : "Generate 10 More MCQs"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Extracts just the questions (used to avoid duplicates)
function extractQuestions(html: string): string[] {
  const questionRegex = /<p>\s*\d+\. (.*?)<\/p>/g;
  const matches = [...html.matchAll(questionRegex)];
  return matches.map((m) => m[1].trim());
}
