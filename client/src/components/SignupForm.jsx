import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Axios from 'axios';
import { toast } from 'react-toastify';
import { CgSpinnerTwoAlt } from "react-icons/cg";

const SignupForm = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const createUser = async (e) => {
    setIsLoading(true);
    e.preventDefault();

    try {
      const response = await Axios.post('http://localhost:8000/api/register', {
        fullName: fullName,
        username: username,
        email: email,
        password: password
      });

      if (response.status === 200) {
        toast.success(response.data.message);
        localStorage.setItem('userData', JSON.stringify({ fullName, username, email }));
        // Redirect to profile
        navigate('/profile');
      } else {
        toast.error(response.data.error);
      }
    } catch (error) {
      toast.error("User May Already Exist.")
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <h1 className='font-bold text-3xl'>Learning Management</h1>
      <div className='border border-slate-950 rounded-lg p-5 mt-6 dark:border-slate-400'> 
        <p className='text-xl mt-4'>Create Account</p>
        <form className='mt-4 flex flex-col gap-3'>
          <input
            type="text"
            placeholder='Fullname'
            value={fullName}
            required
            className='w-72 h-10 outline-none focus-within:pl-4 duration-200 bg-transparent border border-slate-950 dark:border-slate-400 rounded-md pl-2'
            onChange={(e) => setFullName(e.target.value)}
          />
          <input
            type="email"
            placeholder='Email'
            value={email}
            required
            className='w-72 h-10 outline-none focus-within:pl-4 duration-200 bg-transparent border border-slate-950 dark:border-slate-400 rounded-md pl-2'
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="text"
            placeholder='Username'
            value={username}
            required
            className='w-72 h-10 outline-none focus-within:pl-4 duration-200 bg-transparent border border-slate-950 dark:border-slate-400 rounded-md pl-2'
            onChange={(e) => setUsername(e.target.value)}
          />
          <div className='w-72 focus-within:pl-2 duration-200 h-10 flex items-center justify-between border border-slate-950 dark:border-slate-400 rounded-md'>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder='Password'
              value={password}
              required
              className='pl-2 h-full outline-none bg-transparent'
              onChange={(e) => setPassword(e.target.value)}
            />
            <span onClick={() => setShowPassword(!showPassword)} className='pr-4 cursor-pointer'>
              {showPassword ? <FaEyeSlash /> : <FaEye /> }
            </span>
          </div>
          <button
            onClick={createUser}
            className='bg-cyan-950 h-10 rounded-md cursor-pointer'
          >
            {isLoading ? <CgSpinnerTwoAlt className='mx-auto animate-spin' size={20} /> : 'SIGNUP'}
          </button>
        </form>
        <p className='mt-4 text-center'>Already have an account? <span onClick={() => navigate('/')} className='text-blue-600 cursor-pointer hover:underline'>Log In</span></p>
      </div>
    </div>
  )
}

export default SignupForm;
