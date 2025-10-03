"use client";

import { useSearchParams } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { Textarea } from "./ui/textarea";
import { debounceTimeout } from "@/lib/constants";
import useNote from "@/hooks/useNote";
import { updateNoteAction } from "@/actions/notes";
import { smartLookupAction } from "@/actions/ai";
import { Button } from "@/components/ui/button";

type Props = {
  noteId: string;
  startingNoteText: string;
};

let updateTimeout: NodeJS.Timeout;

function NoteTextInput({ noteId, startingNoteText }: Props) {
  const noteIdParam = useSearchParams().get("noteId") || "";
  const { noteText, setNoteText } = useNote(); // This is a custom hook that we will create in the next step
  const [selectedText, setSelectedText] = useState<string>("");
  const [showButton, setShowButton] = useState<boolean>(false);
  const [showHint, setShowHint] = useState<boolean>(false);
  const [lastActionType, setLastActionType] = useState<string>("");
  const [processing, setProcessing] = useState<boolean>(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [showToolbar, setShowToolbar] = useState(false);


  useEffect(() => {
    if (noteIdParam === noteId) {
      setNoteText(startingNoteText);
    }
  }, [startingNoteText, noteIdParam, noteId, setNoteText]);

  //   const handleSelectText = () => {
  //     const selection = window.getSelection();
  //     if (!selection || selection.rangeCount === 0) {
  //       setShowButton(false);
  //       return;
  //     }

  //     const selected = selection.toString();
  //     if (!selected.trim()) {
  //       setShowButton(false);
  //       return;
  //     }

  //     const range = selection.getRangeAt(0);
  //     const rect = range.getBoundingClientRect();

  //     // Calculate position relative to the viewport
  //     setButtonPos({
  //       top: rect.bottom + window.scrollY + 5, // Position below text with a small offset
  //       left: rect.right + window.scrollX + 5, // Position to the right with a small offset
  //     });

  //     setSelectedText(selected);
  //     setShowButton(true);
  //   };

  const handleSelectText = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      setSelectedText("");
      setShowHint(false);
      return;
    }

    const selected = selection.toString();
    if (!selected.trim()) {
      setSelectedText("");
      setShowHint(false);
      return;
    }

    setSelectedText(selected);
    setShowHint(true);

    // Hide hint after 3 seconds
    setTimeout(() => {
      setShowHint(false);
    }, 3000);
  };

  //   const handleClick = async () => {
  //     if (!selectedText || !textareaRef.current) return;

  //     try {
  //       const result = await smartLookupAction(selectedText);

  //       const textarea = textareaRef.current;
  //       const start = textarea.selectionStart;
  //       const end = textarea.selectionEnd;

  //       const newText =
  //         noteText.substring(0, start) + result + noteText.substring(end);

  //       setNoteText(newText);
  //       updateNoteAction(noteId, newText);
  //       setShowButton(false);
  //     } catch (error) {
  //       console.error("Failed to run smartLookupAction:", error);
  //     }
  //   };

  const handleKeyDown = async (e: React.KeyboardEvent) => {
    if (!selectedText.trim()) return;

    // Ctrl+A or Alt+A for Ask AI
    if ((e.ctrlKey || e.metaKey) && e.key === "a") {
      e.preventDefault();
      setProcessing(true);
      setLastActionType("Ask AI");

      try {
        const result = await smartLookupAction(selectedText);
        const textarea = textareaRef.current;
        if (textarea) {
          const start = textarea.selectionStart;
          const end = textarea.selectionEnd;
          const newText =
            noteText.substring(0, start) + result + noteText.substring(end);
          setNoteText(newText);
          updateNoteAction(noteId, newText);
        }
      } catch (error) {
        console.error("Failed to run smartLookupAction:", error);
      } finally {
        setProcessing(false);
        setTimeout(() => setLastActionType(""), 2000);
      }
    }
  };

  const handleUpdateNote = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNoteText(text);

    clearTimeout(updateTimeout);
    updateTimeout = setTimeout(() => {
      updateNoteAction(noteId, text);
    }, debounceTimeout);
  };

  const handleAskAI = async () => {
    if (!selectedText || !textareaRef.current) return;

    try {
      const result = await smartLookupAction(selectedText);

      const textarea = textareaRef.current;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      const newText =
        noteText.substring(0, start) + result + noteText.substring(end);

      setNoteText(newText);
      updateNoteAction(noteId, newText);
      setShowToolbar(false);
    } catch (error) {
      console.error("Failed to run smartLookupAction:", error);
    }
  };

  return (
    <>
      <Textarea
        ref={textareaRef}
        value={noteText}
        onChange={handleUpdateNote}
        onMouseUp={handleSelectText}
        onKeyDown={handleKeyDown}
        placeholder="Type your notes here..."
        className="custom-scrollbar placeholder:text-muted-foreground mb-4 h-full max-w-4xl resize-none border p-4 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      {/* {showButton && (
        <Button
          className="absolute left-2 z-10 rounded bg-blue-500 p-2 text-sm text-white shadow"
          style={{
            position: "absolute",
            top: buttonPos.top,
            left: buttonPos.left,
          }}
          onClick={handleClick}
        >
          Ask AI
        </Button>
      )} */}
      {showHint && selectedText && (
        <div className="fixed right-6 bottom-6 z-50 rounded-lg bg-gray-800 px-4 py-3 text-sm text-white shadow-xl transition-opacity">
          <div className="mb-1 font-medium">Selection options:</div>
          <div className="text-gray-300">
            <div>Ctrl+A: Ask AI</div>
          </div>
        </div>
      )}

      {/* {processing && (
        <div className="fixed top-6 right-6 z-50 flex items-center rounded-lg bg-blue-600 px-4 py-2 text-white shadow-xl">
          <svg
            className="mr-3 -ml-1 h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          Processing...
        </div>
      )} */}

      {/* {lastActionType && !processing && (
        <div className="fixed top-6 right-6 z-50 rounded-lg bg-green-600 px-4 py-2 text-white shadow-xl">
          {lastActionType} completed!
        </div>
      )} */}
    </>
  );
}

export default NoteTextInput;
