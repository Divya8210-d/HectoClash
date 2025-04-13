import React from 'react'
import { useState } from 'react'
import { app } from '../firebase';
import { getAuth ,createUserWithEmailAndPassword} from "firebase/auth";
import { getFirestore,collection,getDocs ,addDoc,deleteDoc,doc,query,where} from "firebase/firestore";
import { useNavigate } from 'react-router';



const auth = getAuth(app)
const db = getFirestore(app);


const Signup = () => {
        const navigate = useNavigate();
    const [username, setUsername] = useState("")
    const [email, setEmail] = useState("")
  
    const [password, setPassword] = useState("")
   
  
  async  function Signup (e) {e.preventDefault()
    //    const querySnapshot = await getDocs(collection(db, "waiting"));

//created user
          createUserWithEmailAndPassword(auth, email,password)

  
          .then(async (result) =>{
         alert("Yoo!! you have registered now enjoy")

         const q = query(collection(db, "users"), where("Email", "==", result.user.email));
         const checkeddoc= await getDocs(q);
if(checkeddoc.empty){
         try {
                const userRef = await addDoc(collection(db, "users"), {
                 Playername:username,
                 PlayerEmail:result.user.email
               
                });


              


               
              } catch (e) {
                console.error("error in saving user", e);
              }
        }





         localStorage.setItem("loggeduser",result.user.email
          
         );
         navigate('/')
   
//getting checked the waiting rrom and adding user 

         //setting form empty
            setEmail("")
         setPassword("")
         setUsername("")



          }).catch((err)=>{
    alert(err.message)


          })
     
   }



   
  
  
    return (


        <div className="relative h-screen w-screen  bg-cover bg-center  bg-gradient-to-r from-[#00CAFF] to-[#6EFE3B]">
        {/* Blurred Overlay */}
        <div className="absolute inset-0 #09B2DE bg-black/50 flex items-center justify-center">
          {/* Signup Form */}
          <div className=" bg-[#233179] text-white rounded-2xl shadow-xl p-8 w-full max-w-md">
            <h2 className="text-2xl font-bold text-center mb-6">Create Account</h2>
  
            <form onSubmit={Signup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Username</label>
                <input
                  type="text"
                  placeholder="Enter username"
                  className=" bg-[#99C9D5]  w-full p-2 border rounded-xl focus:outline-none focus:ring focus:border-blue-400"
               value={username} onChange={(e)=>{setUsername(e.target.value)}} />
              </div>
  
              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input 
                  type="email"
                  placeholder="Enter email"
                  className=" bg-[#99C9D5]  w-full p-2 border rounded-xl focus:outline-none focus:ring focus:border-blue-400"
                  value={email} onChange={(e)=>{setEmail(e.target.value)}}  />
              </div>
  
              <div>
                <label className="block text-sm font-medium mb-1">Password</label>
                <input
                  type="password"
                  placeholder="Enter password"
                  className=" bg-[#99C9D5]  w-full p-2 border rounded-xl focus:outline-none focus:ring focus:border-blue-400"
                  value={password} onChange={(e)=>{setPassword(e.target.value)}} />
              </div>
  
              <button
                type="submit"
                className="w-[150px] relative left-[120px] bg-[#6EFE3B] text-white py-2 rounded-3xl "
              >
                Create Account
              </button>
            </form>
  
            <div className="mt-6 flex items-center justify-center">
              <div className="w-full h-px bg-gray-300"></div>
              <span className="px-2 text-gray-500 text-2xl">OR</span>
              <div className="w-full h-px bg-gray-300"></div>
            </div>
  
            <button
              
              className="mt-4 w-full flex items-center justify-center gap-2 bg-white hover:bg-red-600 text-black py-2 rounded-3xl transition"
            >
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
          </div>
        </div>
      </div>
    
    )
}

export default Signup       
/*  <>
<form onSubmit={Signup}>
          <input className='h-8 w-40 border-solid' placeholder='username' type='text' value={username} onChange={(e)=>{
  
  setUsername(e.target.value)  
  
  
  }}></input>
          <input type='email'  className='h-8 w-40 border-solid' placeholder='email' value={email} onChange={(e)=>{
  
  setEmail(e.target.value)}  }></input>
          <input type='password'  className='h-8 w-40 border-solid' placeholder='password' value={password} onChange={(e)=>{
  
  setPassword(e.target.value)  }}></input>
       <button type='submit' className='h-8 w-40 bg-black'>submit</button>
       </form>
      </>*/





      /*
if(querySnapshot.empty){
        try {
                const waitRef = await addDoc(collection(db, "waiting"), {
                 Name:username,
                 Email:result.user.email
                });
               
              } catch (e) {
                console.error("error in adding user ", e);
              }
              
 }
           
else{

async function setmatch() {
        const waitingplayer = querySnapshot.docs[0]
        try {
                const matchRef = await addDoc(collection(db, "match"), {
                 Player1:username,
                 Email1:result.user.email,
                 Player2:waitingplayer.data().Name,
                 Email2:waitingplayer.data().Email,
                });


               const deleting =await deleteDoc(doc(db, "waiting", waitingplayer.id));


               
              } catch (e) {
                console.error("error in creating match", e);
              }




        
}


setmatch()

}
*/