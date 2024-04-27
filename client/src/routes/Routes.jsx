import { createBrowserRouter } from 'react-router-dom'
import Login from '../pages/Login'
import SignUp from '../pages/SignUp'
import Profile from '../pages/Profile'
import Courses from '../pages/Courses'

export const routes = createBrowserRouter([
  {
    path: '/',
		element: <Login />
  },
	{
		path: '/signup',
    element: <SignUp />
	},
  {
    path: '/profile',
    element: <Profile />
  },
  {
    path: '/courses',
    element: <Courses />
  }
])



// CUSTOM HOOK - $2a$10$SjxkK4s60Q8qZ2RmBS57Y.gKEdOakedjfzAuWc.Jy1IOO5q3wGPnK