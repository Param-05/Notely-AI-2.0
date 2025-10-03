"use client";

import useNote from "@/hooks/useNote";
import { Note } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import Link from "next/link";

type Props = {
  note: Note;
};

function SelectNoteButton({ note }: Props) {
  const noteId = useSearchParams().get("noteId") || "";

  // const { noteText: selectedNoteText } = useNote();
  const { noteTitle: selectedNoteTitle } = useNote();
  const [shouldUseGlobalNoteText, setShouldUseGlobalNoteText] = useState(false);
  // const [localNoteText, setLocalNoteText] = useState(note.text);
  const [localNoteTitle, setLocalNoteTitle] = useState(note.title);

  useEffect(() => {
    if (noteId === note.id) {
      setShouldUseGlobalNoteText(true);
    } else {
      setShouldUseGlobalNoteText(false);
    }
  }, [noteId, note.id]);

  // useEffect(() => {
  //   if (shouldUseGlobalNoteText && selectedNoteText) {
  //     setLocalNoteText(selectedNoteText);
  //   }
  // }, [selectedNoteText, shouldUseGlobalNoteText]);
  // useEffect(() => {
  //   if (shouldUseGlobalNoteText && selectedNoteTitle) {
  //     setLocalNoteTitle(selectedNoteTitle);
  //   }
  // }, [selectedNoteTitle, shouldUseGlobalNoteText]);

  // // const blankNoteText = "EMPTY NOTE";
  // const blankNoteTitle = "Untitled";
  // // let noteText = localNoteText || blankNoteText;
  // let noteTitle = localNoteTitle || blankNoteTitle;
  // if (shouldUseGlobalNoteText) {
  //   // noteText = selectedNoteText || blankNoteText;
  //   noteTitle = note.title || blankNoteTitle;
  // }

  useEffect(() => {
    if (noteId === note.id) {
      setShouldUseGlobalNoteText(true);
    } else {
      setShouldUseGlobalNoteText(false);
    }
  }, [noteId, note.id]);

  useEffect(() => {
    if (shouldUseGlobalNoteText && selectedNoteTitle !== undefined) {
      setLocalNoteTitle(selectedNoteTitle);
    }
  }, [selectedNoteTitle, shouldUseGlobalNoteText]);

  const blankNoteTitle = "Untitled";
const noteTitle = localNoteTitle?.trim() === "" ? blankNoteTitle : localNoteTitle;
  return (
    <SidebarMenuButton
      asChild
      className={`items-start gap-0 pr-12 ${note.id === noteId && "bg-sidebar-accent/50"}`}
    >
      <Link href={`/notes/?noteId=${note.id}`} className="flex h-fit flex-col">
        <p className="w-full truncate overflow-hidden text-ellipsis whitespace-nowrap">
          {/* {noteText} */}
          {noteTitle}
        </p>
        <p className="text-muted-foreground text-xs">
          {note.updatedAt.toLocaleDateString()}
        </p>
      </Link>
    </SidebarMenuButton>
  );
}

export default SelectNoteButton;
