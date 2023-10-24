'use client'

import React,{useState, useEffect} from 'react'
import {auth,storage,db} from  '../firebase'
import { signInWithPopup, GoogleAuthProvider, signOut, updateProfile  } from 'firebase/auth'
import { useRouter } from 'next/navigation'
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, setDoc, addDoc, collection } from "firebase/firestore"; 
import { useMyContext } from '../context'

function page() {
  
  const router = useRouter()
  const data = auth
  const [user, setUser] = useState();
  const [state_err, setErr] = useState(false);

  console.log(' User ------ ', data)

  const googleAuth = new GoogleAuthProvider();

  const login = async() => {
    try{
    const result = await signInWithPopup(auth, googleAuth)
    console.log('Result ----- ', result.user)
    setUser(result.user)

    const id = result.user.uid;
    const name = result.user.displayName;
    const email = result.user.email;
    const photourl = result.user.photoURL


    console.log('user id ---- ', id)
    console.log('Name ---- ', name)
    console.log('Email ---- ', email)
    console.log('Photo Url ----- ',photourl)


const storageRef = ref(storage, name);
const file = {
  uid: id,
  name: name,
  email: email,
  photoURL: photourl
}

const uploadTask = uploadBytesResumable(storageRef, photourl);

console.log('uploadTask ----- ', uploadTask)

uploadTask.on( 
  (error) => {
    setErr(true)
  }, 
  () => {
    getDownloadURL(uploadTask.snapshot.ref).then( async (downloadURL) => {
      // console.log('File available at', downloadURL);
      // await updateProfile(result.user,{
      //   name,
      //   photoURL: downloadURL,
      // });
      await setDoc(doc(db, "users" , id), {
        uid: id,
        name,
        email,
        photoURL: photourl,
      });

      await setDoc(doc(db, 'userChats', result.user.uid),{})
    
    });
    console.log('getDownloadURL ----- ',getDownloadURL)
  }
);

router.push('./chat')

    }catch(err){
      setErr(true)
      console.log('Login Error ---- ',err)
    }
  }

  useEffect(()=>{
    console.log('User ---- ', user)
  },[user])

  return (
    <div className='flex align-middle items-center justify-center h-80 border w-full'>
      {/* <h1 className='text-2xl text-black font-bold ' >Login With Google</h1> */}

      {/* {
        user ? (
          <button onClick={()=>logout()} className='text-xl border p-3'>
        Logout
      </button>
        ) : ( */}
          <button 
          class="px-4 py-2 border flex gap-2 border-slate-200 rounded-lg text-slate-700 hover:border-slate-400 hover:text-slate-900 hover:shadow transition duration-150" 
          onClick={login}
          >
            <img class="w-6 h-6" src="https://www.svgrepo.com/show/475656/google-color.svg" loading="lazy" alt="google logo" />
            <span>Login with Google</span>
          </button>
        {/* )
      } */}
      {/* <div onClick={()=>auth.signOut()}> */}
      {/* {user ? `Welcome ${user.displayName}` : ""} */}
      {/* </div> */}
    </div>
  )
}

export default page