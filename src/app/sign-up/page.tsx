import React from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import AuthForm from '@/components/AuthForm'

function SignUpPage() {
  return (
    <div className='mt-20 flex flex-1 flex-col items-center'>
        <Card className='w-full max-w-md'>
            <CardHeader className='mb-4'>
                <CardTitle className='text-3xl text-center'>Sign up</CardTitle>
            </CardHeader>
            <AuthForm type='sign-up'></AuthForm>
        </Card>
    </div>
  )
}

export default SignUpPage