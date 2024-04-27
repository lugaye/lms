import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GiSpellBook } from "react-icons/gi";
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { toast } from 'react-toastify';
import { LuLogOut } from 'react-icons/lu';

const CoursesTab = () => {
  const [userCourses, setUserCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [registeredCourses, setRegisteredCourses] = useState([]);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const [isPopup, setIsPopup] = useState(false);

  // You can update the percentage or echo directly on the element using map
  const percentage = 60;

  const dropout = async (course_id) => {
    try{
      const response = await Axios.post('http://localhost:8000/api/dropout', {
        email: email,
        courseId: course_id
      });

      if(response.status === 200) {
        toast.success("Achievement: Dropout");
        setRegisteredCourses(prevCourses => prevCourses.filter(course => course.id !== course_id));
      } else {
        toast.error("Opearation Failed");
      }
    } catch(error){
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
      }
    }

    const fetchUserCourses = async () => {
      try {
        const response = await Axios.post('http://localhost:8000/api/courses/user', { email: email });
        if (response.status === 200) {
          setUserCourses(response.data.courses.map(course => course.course_id));
        } else {
          console.error("Failed to fetch user courses");
        }
      } catch (err) {
        console.error("Failed to fetch user courses", err);
      }
    }

    const fetchAllCourses = async () => {
      try {
        const response = await Axios.get('http://localhost:8000/api/courses');
        if (response.status === 200) {
          setAllCourses(response.data.courses);
        } else {
          console.error("Failed to fetch all courses");
        }
      } catch (err) {
        console.error("Failed to fetch all courses", err);
      }
    }

    fetchUserData();
    fetchAllCourses();
    fetchUserCourses();
  }, [email, navigate]);

  useEffect(() => {
    const filteredCourses = allCourses.filter(course => userCourses.includes(course.id));
    setRegisteredCourses(filteredCourses);
  }, [allCourses, userCourses]);

  return (
    <div className='pb-16 relative'>
      <div className='pt-4 pr-4 w-full flex justify-end'>
        <button onClick={() => navigate('/courses')} className='py-1 px-4 rounded-md border cursor-pointer border-slate-950 hover:text-slate-200 hover:dark:bg-slate-200 hover:dark:text-slate-950 hover:bg-slate-950 transition-colors duration-300 dark:border-slate-200'>
          EXPLORE COURSES
        </button>
      </div>
      <div className='mt-6'>
        {registeredCourses.length > 0 ? (
          <div>
             <h2 className='text-xl font-bold pl-5 mb-10'>YOUR COURSES:</h2>
             <div className='grid md:grid-cols-2 lg:grid-cols-3'>
              {registeredCourses.map((course, index) => (
                <div key={index} className='border mt-8 w-[340px] border-slate-950 rounded-md dark:border-slate-400 p-4'>
                  <GiSpellBook size={35} />
                  <p className='mt-4 text-xl'> {course.name} </p>
                  <div className='flex justify-center'>
                    <div className='w-24 mt-4 h-24'>
                      <CircularProgressbar value={percentage} text={`${percentage}%`} />
                    </div>
                  </div>
                  <div className='mt-4 flex justify-between px-3'>
                    <button onClick={() => dropout(course.id)} className='text-red-500 border border-red-500 py-1 rounded-md cursor-pointer px-4 font-semibold hover:bg-red-500 hover:text-gray-200 dark:hover:text-gray-950 transition-colors duration-200'>DROPOUT</button>
                    <button onClick={() => setIsPopup(true)} className='text-green-500 border border-green-500 py-1 rounded-md cursor-pointer px-4 font-semibold hover:bg-green-500 hover:text-gray-200 dark:hover:text-gray-950 transition-colors duration-200'>CONTINUE</button>
                  </div>
                </div>
              ))}
             </div>
          </div>
        ) : (
          <div className='text-center px-4'>
            <p>You haven't registered for a course yet. Checkout <span onClick={() => navigate('/courses')} className='text-blue-500 cursor-pointer hover:underline'>ALL COURSES</span> and register for one to start learning.</p>
          </div>
        )}
      </div>
      <div className={isPopup ? 'absolute top-0 left-0 w-full h-screen' : 'hidden'}>
        <div className='flex justify-center items-center w-full h-screen z-50'>
          <div className='w-80 h-80 bg-slate-400 dark:bg-slate-800 p-10 rounded-lg uppercase'>
            <p className='text-xl font-bold text-center py-2'>Course materials under construction.</p>
            <p className='text-xl font-bold text-center py-2'>Check back later.</p>
            <button className='flex justify-center gap-3 items-center border border-gray-950 py-1 px-5 rounded-md mt-20 mx-auto hover:bg-gray-950 hover:text-slate-100'>
              <LuLogOut className='rotate-180' />
              <span onClick={() => setIsPopup(false)}>CLOSE</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default CoursesTab;
