'use client'

import React, { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Input } from './ui/input'
import { debounceTimeout } from '@/lib/constants'
import useNote from '@/hooks/useNote'
import { updateNoteTitleAction } from '@/actions/notes'

type Props = {
  noteId: string
  startingTitle: string
}

let updateTimeout: NodeJS.Timeout

export default function NoteTitleInput({ noteId, startingTitle }: Props) {
  const noteIdParam = useSearchParams().get('noteId') || ''
  const { noteTitle, setNoteTitle } = useNote()

  // Initialize the title when the active note changes
  useEffect(() => {
    if (noteIdParam === noteId) {
      setNoteTitle(startingTitle)
    }
  }, [startingTitle, noteIdParam, noteId, setNoteTitle])

  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value
    setNoteTitle(title)
    clearTimeout(updateTimeout)
    updateTimeout = setTimeout(() => {
      updateNoteTitleAction(noteId, title)
    }, debounceTimeout)
  }

  return (
    <Input
      value={noteTitle}
      onChange={onTitleChange}
      placeholder="Untitled"
      // className="w-full max-w-4xl border p-2 text-lg font-semibold focus-visible:ring-0"
      className="w-full max-w-4xl border p-2 focus-visible:ring-0 text-4xl font-bold px-4 py-4 h-auto"
    />
  )
}
