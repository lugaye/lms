import React from 'react'
import { LuLogOut } from "react-icons/lu";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const SettingsTab = () => {
  const navigate = useNavigate();

  // CUSTOM HOOK - $2a$10$SjxkK4s60Q8qZ2RmBS57Y.gKEdOakedjfzAuWc.Jy1IOO5q3wGPnK

  const logout = () => {
    localStorage.clear();
    toast.success("Logged Out");
    navigate("/");
  }

  return (
    <div className='px-5 py-10'>
      <div>
        <div>

        </div>
        <div className='mt-10'>
          <button onClick={logout} className='text-red-500 flex justify-start py-[6px] hover:bg-red-500 hover:text-slate-100 dark:hover:text-slate-950 duration-200 px-12 gap-2 rounded-md items-center border border-red-500'>
            <LuLogOut className=' rotate-180 mt-1' />
            <span>Log Out</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsTab