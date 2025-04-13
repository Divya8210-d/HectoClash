import React from 'react'
import { NavLink,useNavigate } from 'react-router'
import { getAuth ,signInWithEmailAndPassword} from "firebase/auth";
import { app } from '../firebase';
import { useState } from 'react';

const auth = getAuth(app)





const Signin = () => {

  const navigate = useNavigate();
  
  const [email, setEmail] = useState("")

  const [password, setPassword] = useState("")




function Signin(e) {e.preventDefault()
  signInWithEmailAndPassword(auth, email, password)

  .then(()=>{
  localStorage.setItem("loggeduser",email
          
         )
    navigate('/')


  })




  
}






  return (
    <div className="h-screen w-screen  bg-cover bg-center   bg-gradient-to-r from-[#00CAFF] to-[#6EFE3B]">
      <div className="flex items-center justify-center h-full w-full backdrop-blur-sm bg-black/30">
        <div className="bg-[#233179] text-white p-8 rounded-2xl shadow-lg max-w-sm w-full">
          <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
          <form onSubmit={Signin} >
            <div className="mb-4">
              <label className="block text-white mb-1" >Email</label>
              <input
                type="email"
                id="email"
                value={email}
              
                  onChange={(e)=>{
                    setEmail(e.target.value)
                  }}


                className="bg-[#99C9D5]    w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-white mb-1" htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                
                value={password}
              
                onChange={(e)=>{
                  setPassword(e.target.value)}}
                




                className="bg-[#99C9D5]  w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Login
            </button>
            <p className="text-center mt-4 text-sm text-white">
              New user?{" "}
              <NavLink to="/register" className="text-white hover:underline">
                Register here
              </NavLink>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Signin
