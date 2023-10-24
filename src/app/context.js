"use client"

import react, { createContext, useContext, useEffect, useState } from 'react'
import {auth} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';

const MyContext = createContext(null);

function Context({ children }) {

    const [state_currentUser, setState_currentUser] = useState({});
    const [state_Name, setState_Name] = useState();

    useEffect(()=>{
        onAuthStateChanged(auth, (user)=>{
            setState_currentUser(user)
        })
    },[])

    function sendData(data) {
        setState_Name(data);
      }
  
    return (
      <MyContext.Provider value={{ state_currentUser }}>
        {children}
      </MyContext.Provider>
    );
  }
  
  export default Context;

  export function useMyContext(){
    return useContext(MyContext)
  }