"use client"

import { Note } from "@prisma/client"
import { createContext, useState } from "react"

type NoteProviderContextType = {
    noteText: string
    setNoteText: (text: string) => void
    noteTitle: string
    setNoteTitle: (title: string) => void
    liveNotes: Note[]
    // setLiveNotes: (notes: Note[]) => void
    setLiveNotes: React.Dispatch<React.SetStateAction<Note[]>>
}

export const NoteProviderContext = createContext<NoteProviderContextType>({
  noteText: "",
  setNoteText: () => {},
  noteTitle: "",
  setNoteTitle: () => {},
  liveNotes: [],
  setLiveNotes: () => {},
})

function NoteProvider({children}: {children: React.ReactNode}) {
    const [noteText, setNoteText] = useState("")
    const [noteTitle, setNoteTitle] = useState<string>("")
    const [liveNotes, setLiveNotes] = useState<Note[]>([])

    return (
        <NoteProviderContext.Provider value={{noteText, setNoteText, noteTitle, setNoteTitle, liveNotes, setLiveNotes}}>
            {children}
        </NoteProviderContext.Provider>
    )
}

export default NoteProvider;