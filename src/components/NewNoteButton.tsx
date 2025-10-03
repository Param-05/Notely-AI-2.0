'use client'

import { User } from '@supabase/supabase-js'
import React from 'react'
import { Button } from './ui/button'
import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {v4 as uuidv4} from 'uuid'
import { toast } from "sonner";
import { createNoteAction } from '@/actions/notes'


type Props = {
    user: User | null
}

function NewNoteButton( { user }: Props ) {
  const router = useRouter()
  const [loading, setLoading] = React.useState(false)
  const handleClickNewNoteButton = async () => {
    if (!user) {
      router.push('/login')
    } else {
      setLoading(true)
      const uuid = uuidv4()
      await createNoteAction(uuid)
      router.push(`/?noteId=${uuid}`)
    }
    toast.success('New note created', {
      description: "You have created a new note",
      style: {
          backgroundColor: "#2b9e7d",
      }
      },)
    setLoading(false)
  }
  return (
    <Button
    className='p-5 hover:scale-110 transition-transform hover:bg-[oklch(0.76 0.007 247.896)] dark:hover:bg-[oklch(0.26_0.02_262.13)]'
      onClick={handleClickNewNoteButton}
      variant='secondary'
      disabled={loading}
    >
      {loading ? <Loader2 className='animate-spin' /> : 'New Note'}
    </Button>
  )
}

export default NewNoteButton