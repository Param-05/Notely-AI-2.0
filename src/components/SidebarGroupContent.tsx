"use client";

import {
  SidebarGroupContent as SidebarGroupContentShadCN,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type Props = {
  notes: Note[];
};

import { Note } from "@prisma/client";
import { SearchIcon } from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";
import { Input } from "./ui/input";
import Fuse from "fuse.js";
import SelectNoteButton from "@/components/SelectNoteButton";
import DeleteNoteButton from "@/components/DeleteNoteButton";
import useNote from "@/hooks/useNote";

function SidebarGroupContent({ notes }: Props) {
  const [searchText, setSearchText] = useState("");
  // const [localNotes, setLocalNotes] = useState(notes)
  // const { liveNotes, setLiveNotes } = useNote();
  const [liveNotes, setLiveNotes] = useState<Note[]>([]);

  // useEffect(() => {
  //   setLocalNotes(notes)
  // }, [notes])
  useEffect(() => {
    setLiveNotes(notes);
  }, [notes, setLiveNotes]);

  const localNotes = useMemo(() => liveNotes ?? notes, [liveNotes, notes]);

  // const fuse = useMemo(() => {
  //   return new Fuse(localNotes, {
  //     keys: ["title", "text"],
  //     threshold: 0.4,
  //   });
  // }, [localNotes]);

  // const filteredNotes = searchText
  //   ? fuse.search(searchText).map((result) => result.item)
  //   : localNotes;

  // const deleteNoteLocally = (noteId: string) => {
  //   setLocalNotes((prevNotes) =>
  //     prevNotes.filter((note) => note.id !== noteId),
  //   );
  // };
    // 🔍 Fuse search
    const fuse = useMemo(() => {
      return new Fuse(localNotes, {
        keys: ['title', 'text'],
        threshold: 0.4,
      });
    }, [localNotes]);
  
    const filteredNotes = searchText
      ? fuse.search(searchText).map((result) => result.item)
      : localNotes;
  
    // 🗑 Delete note from context
    const deleteNoteLocally = (noteId: string) => {
      setLiveNotes((prev: Note[]) => prev.filter((note: Note) => note.id !== noteId));
    };

  return (
    // console.log(notes),
    <SidebarGroupContentShadCN>
      <div className="relative">
        <SearchIcon className="absolute top-2.5 left-3 size-4" />
        <Input
          className="bg-muted pl-8"
          placeholder="Search your notes..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
      </div>
      <SidebarMenu className="mt-4">
        {filteredNotes.map((note) => (
          <SidebarMenuItem key={note.id} className="group/item">
            <SelectNoteButton note={note} />
            <DeleteNoteButton
              noteId={note.id}
              deleteNoteLocally={deleteNoteLocally}
            />
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroupContentShadCN>
  );
}

export default SidebarGroupContent;
