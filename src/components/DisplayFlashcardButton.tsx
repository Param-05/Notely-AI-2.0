"use client";

import React, { useState, useTransition } from "react";
import {
  deleteFlashcardById,
  getFlashcardsForNote,
} from "@/actions/flashcards";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Flashcard from "@/components/Flashcard"; // Tailwind-based flipping card
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

type Props = {
  user: User | null;
  noteId: string;
};

export default function DisplayFlashcardsButton({ user, noteId }: Props) {
  const [flashcards, setFlashcards] = useState<
    { id: string; questionText: string; answerText: string }[]
  >([]);
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      // if not logged in, redirect and don’t open the dialog
      if (!user) {
        router.push("/login");
        return;
      }
      setOpen(true);
      startTransition(() => {
        getFlashcardsForNote(noteId).then((result) => {
          setFlashcards(result);
          setIndex(0);
        });
      });
    } else {
      // on close, clear out old cards
      setOpen(false);
      setFlashcards([]);
    }
  };

  const handleNext = () => {
    setIndex((prev) => (prev < flashcards.length - 1 ? prev + 1 : 0));
  };
  const handleDelete = async () => {
    const cardToDelete = flashcards[index];
    if (!cardToDelete) return;

    await deleteFlashcardById(cardToDelete.id);

    setFlashcards((prev) => {
      const updated = [...prev];
      updated.splice(index, 1);
      return updated;
    });

    // Move back a card if on last one
    setIndex((prev) =>
      prev >= flashcards.length - 1 && flashcards.length > 1 ? prev - 1 : prev,
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="hover:bg-[oklch(0.76 0.007 247.896)] p-5 transition-transform hover:scale-110 dark:hover:bg-[oklch(0.26_0.02_262.13)]"
          variant="secondary"
        >
          Display Flashcards
        </Button>
      </DialogTrigger>

      <DialogContent className="flex flex-col items-center gap-4 px-6 py-20">
        <DialogHeader>
          <DialogTitle>Flashcards</DialogTitle>
        </DialogHeader>

        {isPending && (
          <p className="animate-pulse text-sm">Loading flashcards...</p>
        )}

        {!isPending && flashcards.length > 0 && (
          <>
            <Flashcard
            key={flashcards[index].id}
              question={flashcards[index].questionText}
              answer={flashcards[index].answerText}
            />
            <div className="mt-4 flex w-full items-center justify-between">
              <span className="text-sm text-gray-500">
                Card {index + 1} of {flashcards.length}
              </span>
              <div className="flex gap-2">
                <Button variant="destructive" onClick={handleDelete}>
                  Delete
                </Button>
                <Button onClick={handleNext}>
                  {index < flashcards.length - 1 ? "Next" : "Start Over"}
                </Button>
              </div>
            </div>
          </>
        )}

        {!isPending && flashcards.length === 0 && (
          <p className="mt-4 text-sm text-gray-500">
            No flashcards found for this note.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}
