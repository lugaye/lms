import React, { useState, useEffect } from 'react'
import { LuLogOut } from "react-icons/lu";
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AiFillDelete } from "react-icons/ai";
import { MdModeEditOutline } from "react-icons/md";
import Axios from 'axios';

const SettingsTab = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");

  const [editFullName, setEditFullName] = useState(false);
  const [editUserName, setEditUsername] = useState(false);

  const toggleFullName = () => {
    if(editFullName === false){
      setEditFullName(true)
    }
    if(editFullName === true){
      setEditFullName(false);
      updateName();
    }
  }

  const toggleUsername = () => {
    if(editUserName === false){
      setEditUsername(true)
    }
    if(editUserName === true){
      setEditUsername(false);
      updateUsername();
    }
  }

  // CUSTOM HOOK - $2a$10$SjxkK4s60Q8qZ2RmBS57Y.gKEdOakedjfzAuWc.Jy1IOO5q3wGPnK

  const logout = () => {
    localStorage.clear();
    toast.success("Logged Out");
    navigate("/");
  }

  const updateUsername = async () => {
    try{
      const response = await Axios.post('http://localhost:8000/api/update-username', {
        email: email,
        name: username
      });
      if(response.status === 200){
        toast.success("Username updated");
        localStorage.setItem('userData', JSON.stringify({ fullName, username, email }));
        window.location.reload();
      } else{
        toast.error("Operation Failed");
      }
   } catch (error){
    toast.error("Operation Failed");
   }
  }

  const deleteUser = async () => {
    try{
      const response = await Axios.post('http://localhost:8000/api/delete', {
        email: email
      });
      if(response.status === 200){
        toast.success("Account Deleted");
        localStorage.removeItem('userData');
        navigate("/");
      } else {
        toast.error("Server Error");
      }

    } catch(error){
      toast.error("Server Error");
    }
  }

  const updateName = async () => {
    try{
      const response = await Axios.post('http://localhost:8000/api/update-name', {
        email: email,
        name: fullName
      });
      if(response.status === 200){
        toast.success("Name updated");
        localStorage.setItem('userData', JSON.stringify({ fullName, username, email }));
        window.location.reload();
      } else{
        toast.error("Operation Failed");
      }
   } catch (error){
    toast.error("Operation Failed");
   }
  }

  useEffect(() => {
    const fetchUserData = () => {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData) {
        navigate('/');
      } else {
        setEmail(userData.email);
        setFullName(userData.fullName);
        setUsername(userData.username);
      }
    }

    fetchUserData();
  }, []);
  

  return (
    <div className='px-5 py-10'>
      <div>
        <div className='mt-10 border rounded-lg border-slate-950 dark:border-slate-400 py-10 px-5'>
          <div className='flex flex-col justify-start gap-4'>

            <div className='flex justify-start gap-5 items-center'>
              {editFullName ? (
                <input
                  type="text"
                  required
                  placeholder='Full Name'
                  className='w-72 h-10 bg-transparent outline-none border border-black dark:border-white rounded-md pl-2'
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  required
                  placeholder='Full Name'
                  className='w-72 h-10 bg-transparent outline-none border border-blue-600 rounded-md pl-2'
                  value={fullName}
                  readOnly
                />
              )}
              <div onClick={() => toggleFullName()} className='flex justify-start gap-5 items-center cursor-pointer'>
                {editFullName ? <p className='bg-blue-500 py-[7px] font-bold px-[18px] rounded text-black'>SAVE</p> : <MdModeEditOutline size={30} />}
              </div>
            </div>

            <div className='flex justify-start gap-5 items-center'>
              {editUserName ? (
                <input
                  required
                  type="text"
                  placeholder='Username'
                  className='w-72 h-10 bg-transparent outline-none border border-black dark:border-white rounded-md pl-2'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  placeholder='Username'
                  className='w-72 h-10 bg-transparent outline-none border border-blue-600 rounded-md pl-2'
                  value={username}
                  readOnly
                />
              )}
              <div onClick={() => toggleUsername()} className='flex justify-start gap-5 items-center cursor-pointer'>
                {editUserName ? <p className='bg-blue-500 py-[7px] font-bold px-[18px] rounded text-black'>SAVE</p> : <MdModeEditOutline size={30} />}
              </div>
            </div>

            <div className='flex justify-start gap-5 items-center'>
              <input
                type="text"
                placeholder='Email'
                className='w-72 h-10 bg-transparent outline-none border border-blue-600 rounded-md pl-2'
                value={email}
                readOnly
              />
            </div>

          </div>
        </div>
        <div className='mt-10 border border-red-500 rounded-lg px-5 py-10'>
          <p className='text-red-500 py-4 text-xl'>DANGER ZONE</p>
          <button onClick={logout} className='text-red-500 flex justify-start py-[6px] hover:bg-red-500 hover:text-slate-100 dark:hover:text-slate-950 duration-200 px-12 gap-2 rounded-md items-center border border-red-500'>
            <LuLogOut className=' rotate-180 mt-1' />
            <span>Log Out</span>
          </button>
          <p className='mt-10 mb-3'>This process is irreversable and you won't get your account back. BE ABSOLUTELY SURE!!!</p>
          <button onClick={deleteUser} className='text-red-500 flex justify-start py-[6px] hover:bg-red-500 hover:text-slate-100 dark:hover:text-slate-950 duration-200 px-12 gap-2 rounded-md items-center border border-red-500'>
            <AiFillDelete />
            <span>DELETE ACCOUNT</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsTab