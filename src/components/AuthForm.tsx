'use client'
type Props = {
    type: 'login' | 'sign-up'
}

import { useRouter } from 'next/navigation'
import React, { useTransition } from 'react'
import { toast } from "sonner";
import { CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { loginAction, signupAction } from '@/actions/user'


function Authform({ type }: Props) {
    const isLoginForm = type === 'login'
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleSubmit = (formData:FormData) => {
        // console.log(formData)
        // console.log("Form submitted")
        startTransition(async() => {
            const email = formData.get('email') as string
            const password = formData.get('password') as string

            let errorMessage
            let title
            let description

            if(isLoginForm) {
                errorMessage = ( await loginAction(email, password) ).errorMessage
                title = 'Logged in'
                description = 'You have successfully been logged in'
            }
            else {
                errorMessage = ( await signupAction(email, password) ).errorMessage
                title = 'Signed up'
                description = 'Check your email for a confirmation link'
            }
            if(!errorMessage) {
                toast.success(title, { 
                    description: description,
                    style: {
                        backgroundColor: "#2b9e7d",
                    }
                })
                router.replace('/')
            }
            else {
                toast.error('Error', {
                    description: errorMessage,
                    style: {
                        backgroundColor: "#d95556",
                    }
                })
            }
        })
    }
  return (
    <form action={handleSubmit}>
        <CardContent className='grid w-full gap-4 items-center'>
            <div className='flex flex-col space-y-1.5'>
                <Label htmlFor='email'>Email</Label>
                <Input type='email' name='email' id='email' placeholder='Enter your email' required disabled={isPending} />
            </div>
            <div className='flex flex-col space-y-1.5'>
                <Label htmlFor='email'>Password</Label>
                <Input type='password' name='password' id='password' placeholder='Enter your password' required disabled={isPending} />
            </div>
        </CardContent>
        <CardFooter className='mt-4 flex flex-col gap-6'>
            <Button className='w-full' type='submit' disabled={isPending}>
                {isPending ? <Loader2 className='animate-spin' /> : isLoginForm ? 'Login' : 'Sign Up'}
            </Button>
            <p className='text-xs'>
                {isLoginForm ? "Don't have an account? " : "Already have an account? "}
                <Link href={isLoginForm ? '/sign-up' : '/login'} className={`text-blue-500 underline ${isPending ? 'pointer-events-none opacity-50' : ''}`}>
                {isLoginForm ? 'Sign Up' : 'Login'}
                </Link>
            </p>
        </CardFooter>
    </form>
  )
}

export default Authform