import React, { useState, useEffect } from 'react';
import { CgProfile } from "react-icons/cg";
import { useNavigate } from 'react-router-dom';
import CoursesTab from '../components/CoursesTab';
import LeaderBoardTab from '../components/LeaderBoardTab';
import SettingsTab from '../components/SettingsTab';

const Profile = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [tab1, setTab1] = useState(true);
  const [tab2, setTab2] = useState(false);
  const [tab3, setTab3] = useState(false);

  const toggleTab1 = () => {
    setTab1(true);
    setTab2(false);
    setTab3(false);
  }

  const toggleTab2 = () => {
    setTab1(false);
    setTab2(true);
    setTab3(false);
  }

  const toggleTab3 = () => {
    setTab1(false);
    setTab2(false);
    setTab3(true);
  }

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (!userData) {
      navigate('/');
    } else {
      setFullName(userData.fullName);
      setUsername(userData.username);
      setEmail(userData.email);
    }
  }, [navigate]);

  return (
    <div className='bg-slate-200 text-slate-950 dark:text-slate-100 w-full dark:bg-slate-950'>
      <div className='container min-h-screen max-w-7xl mx-auto'>
        <div className='flex flex-row items-center justify-start gap-5 h-32'>
          <div>
           <CgProfile className='w-24 h-24' />
          </div>
          <div>
            <h2 className='text-xl md:text-2xl'>{fullName}</h2>
            <p className='text-sm'> {username} </p>
            <p className='text-green-500 mt-1 md:mt-3'> {email} </p>
          </div>
        </div>
        <hr className='w-full h-[1px] border-none bg-gray-950 dark:bg-gray-400' />
        <div className='mt-5 pb-44'>
          <div className='w-full flex justify-between text-center h-10 border border-gray-950 dark:border-gray-400 rounded-md'>
            <button onClick={toggleTab1} className={tab1 ? 'bg-gray-400 rounded-md font-bold w-[50%] dark:bg-gray-800 duration-300' : 'w-[50%] duration-300 font-bold'}>MY COURSES</button>
            <button onClick={toggleTab2} className={tab2 ? 'bg-gray-400 rounded-md font-bold w-[50%] dark:bg-gray-800 duration-300' : 'w-[50%] duration-300 font-bold'}>LEADERBOARD</button>
            <button onClick={toggleTab3} className={tab3 ? 'bg-gray-400 rounded-md font-bold w-[50%] dark:bg-gray-800 duration-300' : 'w-[50%] duration-300 font-bold'}>SETTINGS</button>
          </div>
          <div className='mt-10 md:border border-slate-950 dark:border-slate-400 p-2 rounded-md'>
            {tab1 && <CoursesTab />}
            {tab2 && <LeaderBoardTab />}
            {tab3 && <SettingsTab />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile;
