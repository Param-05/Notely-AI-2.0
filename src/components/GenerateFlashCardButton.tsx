"use client";

import { generateAndSaveFlashcards } from "@/actions/flashcards";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";
import React, { useTransition } from "react";

type Props = {
  user: User | null;
  noteId: string;
};

export default function GenerateFlashcardsButton({ user, noteId }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      await generateAndSaveFlashcards(noteId);
      toast.success("Flashcards Created", {
        description: "Your flashcards have been successfully generated.",
        duration: 3000,
      });
    });
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <Button 
    className='p-5 hover:scale-110 transition-transform hover:bg-[oklch(0.76 0.007 247.896)] dark:hover:bg-[oklch(0.26_0.02_262.13)]'
      variant="secondary" onClick={handleGenerate} disabled={isPending}>
        {isPending ? "Generating..." : "Generate Flashcards"}
      </Button>
    </div>
  );
}
