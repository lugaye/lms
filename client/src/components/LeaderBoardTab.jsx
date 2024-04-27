import React, { useEffect, useState } from 'react'
import Axios from 'axios';

const LeaderBoardTab = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await Axios.get('http://localhost:8000/api/leaderboard');
        if (response.status === 200) {
          setUsers(response.data.users);
        } else {
          console.error("Failed to fetch leaderboard data");
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard data", error);
      }
    };

    fetchLeaderboard();
  }, []);

  return (
    <div>
      <div className='flex justify-between items-center max-w-md text-xl mt-4 mb-2 mx-auto'>
        <p className='font-bold text-gray-500'>USER</p>
        <p className='font-bold text-gray-500'>SCORE</p>
      </div>
      <hr className='w-[90%] h-[1px] bg-gray dark:bg-gray-400 bg-gray-950 border-none mx-auto' />
      <div className='flex flex-col justify-between items-center max-w-md mx-auto'>
      {users.map((user, index) => (
        <div key={index} className='w-full h-14 flex justify-between items-center'>
          <p> {user.name} </p>
          <p> {user.score} </p>
        </div>
      ))}
      </div>
    </div>
  )
}

export default LeaderBoardTab
