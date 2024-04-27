import React, {useState, useEffect} from 'react'
import { useNavigate } from 'react-router-dom';
import Axios from 'axios';
import { FaAngleRight } from 'react-icons/fa';
import { toast } from 'react-toastify';

const Courses = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState();
  const [availableCourses, setAvailableCourses] = useState([]);

  const newCourse = async (course_id) => {
    try{
      const response = await Axios.post('http://localhost:8000/api/new-course', {
        email: email,
        courseId: course_id
      })

      if(response.status === 200) {
        toast.success("Course Registered");
      } else {
        toast.error("Opearation Failed");
      }
    } catch(error){
      toast.error("Operation Failed");
    }
  }

  useEffect(() => {
    const setUserData = () => {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (!userData) {
        navigate('/');
      } else {
        setEmail(userData.email);
      }
    }

    const fetchCourses = async () => {
      try{
        const response = await Axios.get('http://localhost:8000/api/courses');
        if(response.status === 200){
          setAvailableCourses(response.data.courses);
        } else{
          console.error("Failed to fetch leaderboard data");
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard data", error);
      }
    }

    setUserData();
    fetchCourses();
  }, [navigate]);

  return (
    <div className='bg-slate-200 text-slate-950 dark:text-slate-100 w-full dark:bg-slate-950'>
      <div className='container min-h-screen pb-44 max-w-7xl mx-auto'>
        <div className='pt-4 pr-4 w-full flex justify-end'>
          <button onClick={() => navigate('/profile')} className='py-1 px-4 rounded-md border cursor-pointer border-slate-950 hover:text-slate-200 hover:dark:bg-slate-200 hover:dark:text-slate-950 hover:bg-slate-950 transition-colors duration-300 dark:border-slate-200'>
            YOUR COURSES
          </button>
        </div>
        <div className='w-full pt-10 flex justify-center'>
        <h1 className='text-2xl md:text-3xl font-bold mx-auto w-fit'>ALL COURSES</h1>
        </div>
        <div className='grid md:grid-cols-2 lg:grid-cols-3 mt-10 w-full mx-auto gap-3 px-5'>
          {availableCourses.map((item, index) => (
            <div key={index} className='w-full px-3'>
              <div className="group relative overflow-hidden bg-white dark:bg-gray-700 px-6 pt-10 pb-8 shadow-xl ring-1 ring-gray-900/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:mx-auto sm:max-w-sm sm:rounded-lg sm:px-10">
                <span className="absolute top-10 z-0 h-20 w-20 rounded-full bg-sky-500 transition-all duration-300 group-hover:scale-[10]"></span>
                <div className="relative z-10 mx-auto max-w-md">
                  <span className="grid h-20 w-20 place-items-center rounded-full bg-sky-500 transition-all duration-300 group-hover:bg-sky-400">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-10 w-10 text-white transition-all">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375m-13.5 3.01c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.184-4.183a1.14 1.14 0 01.778-.332 48.294 48.294 0 005.83-.498c1.585-.233 2.708-1.626 2.708-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
                    </svg>
                  </span>
                  <div className="space-y-6 pt-5 text-xl leading-7 text-gray-600 dark:text-gray-100 transition-all duration-300 group-hover:text-white/90">
                    <p> {item.name} </p>
                  </div>
                  <div className="pt-5 text-base font-semibold leading-7">
                    <span onClick={() => newCourse(item.id)} className='flex justify-start border-[2px] border-transparent hover:border-slate-500 py-1 px-5 rounded-md cursor-pointer gap-2 w-fit'>
                      <a href="#" className='text-sky-500 transition-all duration-300 group-hover:text-black'>REGISTER</a>
                      <FaAngleRight className='mt-[8px] hidden group-hover:flex transition-all text-slate-950 duration-300' />
                    </span>
                    </div>
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Courses