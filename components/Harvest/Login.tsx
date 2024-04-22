import React from 'react'
import { Button } from '@/components/ui/button'
import { closeModal } from './utils'

export const Login = () => {
  const onLogin = () => {
    window.open('https://www.notion.so/login')
    closeModal()
  }
  return (
    <div className='w-full p-4 flex flex-col items-center'>
      <p>To save this page to Notion, </p>
      <p className='mb-3'>please log in first.</p>
      <Button onClick={onLogin}>Log In</Button>
    </div>
  )
}
