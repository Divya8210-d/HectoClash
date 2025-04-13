import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter ,RouterProvider,createBrowserRouter } from 'react-router'
import Signup from './components/Signup.jsx'
import Home from './Home.jsx'
import Signin from './components/Signin.jsx'
import Game from './Game.jsx'
import { Result } from './Result.jsx'
import Leaderboard from './Leaderboard.jsx'

const rout= createBrowserRouter([
  {path:"/",
     element:<App/>,

children :[
  {path:"" ,element:<Home/>},
{path:"login" ,element:<Signin/>},
{path:"register" ,element:<Signup/>},
{path:"game" ,element:<Game/>},
{path:"result" ,element:<Result/>},
{path:"leader" ,element:<Leaderboard/>}
]} 
      
  ]
)


createRoot(document.getElementById('root')).render(
 <RouterProvider router={rout}></RouterProvider>
)
