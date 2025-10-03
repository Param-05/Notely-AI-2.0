import React from 'react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import AuthForm from '@/components/AuthForm'

function LoginPage() {
  return (
    <div className='mt-20 flex flex-1 flex-col items-center'>
        <Card className='w-full max-w-md'>
            <CardHeader className='mb-4'>
                <CardTitle className='text-3xl text-center'>Login</CardTitle>
            </CardHeader>
            <AuthForm type='login'></AuthForm>
        </Card>
    </div>
  )
}

export default LoginPage