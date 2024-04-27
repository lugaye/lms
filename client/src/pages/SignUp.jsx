import React from 'react'
import SignupForm from '../components/SignupForm'

const SignUp = () => {
  return (
    <div className='bg-slate-200 text-slate-950 dark:text-slate-100 w-full dark:bg-slate-950'>
      <div className='container min-h-screen max-w-7xl mx-auto'>
        <div className='grid md:grid-cols-2'>
          <div className='hidden md:flex flex-col justify-center items-center h-screen w-full bg-cyan-950'>

          </div>
          <div className='flex flex-col justify-center items-center h-screen w-full'>
            <SignupForm />
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp