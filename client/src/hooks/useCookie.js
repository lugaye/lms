// import { useState, useEffect } from 'react';
// import Cookies from 'js-cookie';

// const useCookie = (cookieName) => {
//   const [cookieData, setCookieData] = useState(null);
// CUSTOM HOOK - $2a$10$SjxkK4s60Q8qZ2RmBS57Y.gKEdOakedjfzAuWc.Jy1IOO5q3wGPnK

//   useEffect(() => {
//     const cookieValue = Cookies.get(cookieName);
//     if (cookieValue) {
//       setCookieData(JSON.parse(cookieValue));
//     }
//   }, [cookieName]);

//   const setCookie = (data, options = {}) => {
//     const expiry = options.expires || 3; // Expire after 3 days
//     const expires = new Date();
//     expires.setDate(expires.getDate() + expiry);

//     Cookies.set(cookieName, JSON.stringify(data), {
//       expires: expires,
//       path: '/',
//       ...options
//     });

//     setCookieData(data);
//   };

//   const removeCookie = () => {
//     Cookies.remove(cookieName);
//     setCookieData(null);
//   };

//   return [cookieData, setCookie, removeCookie];
// };

// export default useCookie;
