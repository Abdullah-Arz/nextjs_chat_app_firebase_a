"use client"

import react, { createContext, useContext, useEffect, useReducer, useState } from 'react'
import {auth} from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useMyContext } from './context';

const MyChatContext = createContext(null);

function ChatContext({ children }) {

    const {state_currentUser} = useMyContext();
    
    const INITIAL_STATE = {
        chatId : "null",
        user:{}
    }

    const chatReducer = (state, action) => {
        switch(action.type){
            case "CHANGE_USER":
                return{
                    user: action.payload,
                    chatId: state_currentUser.uid > action.payload.uid ? state_currentUser.uid + action.payload.uid : action.payload.uid + state_currentUser.uid
                }

                default:
                    return state;
        }
    }

    const [state, dispatch] = useReducer(chatReducer, INITIAL_STATE)
   
    return (
      <MyChatContext.Provider value={{ data:state, dispatch }}>
        {children}
      </MyChatContext.Provider>
    );
  }
  
  export default ChatContext;

  export function useMyChatContext(){
    return useContext(MyChatContext)
  }