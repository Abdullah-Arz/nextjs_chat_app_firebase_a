"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@nextui-org/react";
import { auth } from "../firebase";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { useMyContext } from "../context";
import { db } from "../firebase";
import {
  Timestamp,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { useMyChatContext } from "../chatcontext";
import { v4 as uuid } from "uuid";

function page() {

  const [state_Check, setState_Check] = useState(false);
  const [username, setUsername] = useState("");
  const [user, setUser] = useState(null);
  const [err, setErr] = useState(false);
  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [img, setImg] = useState("");
  const [time, setTime] = useState("");
  const router = useRouter();
  const ref = useRef();
  const { state_currentUser } = useMyContext();
  const { dispatch, data } = useMyChatContext();
  var d = new Date();
  console.log("Data ----- ", data);
  console.log("state_currentUser ----- ", state_currentUser);

  useEffect(() => {
    const getChats = () => {
      onSnapshot(doc(db, "userChats", state_currentUser.uid), (doc) => {
        console.log("Current Data: ", doc.data());
        setChats(doc.data());
      });
    };

    state_currentUser && state_currentUser.uid && getChats();
  }, 
  [ state_currentUser && state_currentUser.uid]);

  useEffect(() => {
    onSnapshot(doc(db, "chats", data.chatId), (doc) => {
      // console.log("Current Data: ",doc.data());
      doc.exists() && setMessages(doc.data());
    });
  }, [data.chatId]);

  useEffect(() => {
    ref.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.messages]);

  console.log('Messages ----- ', messages)

  console.log('Chats ----- ', chats)

  // console.log('')

  const handleSearchState = (event) => {
    setUsername(event.target.value);
    console.log("User Search ----- ", event.target.value);
  };

  const handleKey = (event) => {
    event.code === "Enter" ? handleSearch() : null;

    console.log("Handle Key ----- ", event.code);
  };

  const handleSearch = async () => {
    const q = query(collection(db, "users"), where("name", "==", username));

    // console.log("Q ----- ",q)

    try {
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
        setUser(doc.data());
      });
    } catch (err) {
      setErr(true);
    }
  };

  const handleSelect = async () => {
    // check weather the group(chats in firestore) exists, if not create

    const combinedId =
      state_currentUser.uid > user.uid
        ? state_currentUser.uid + user.uid
        : user.uid + state_currentUser.uid;
    console.log("User Select id ----- ", combinedId);

    try {
      setState_Check(true)
      const res = await getDoc(doc(db, "chats", combinedId));
      console.log("user.name", user.name);
      console.log("state_currentUser.name", state_currentUser.displayName);

      if (!res.exists()) {
        await setDoc(doc(db, "chats", combinedId), { messages: [] });

        await updateDoc(doc(db, "userChats", state_currentUser.uid), {
          [combinedId + ".userInfo"]: {
            uid: user.uid,
            displayName: user.name,
            photoURL: user.photoURL
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        await updateDoc(doc(db, "userChats", user.uid), {
          [combinedId + ".userInfo"]: {
            uid: state_currentUser.uid,
            displayName: state_currentUser.displayName,
            photoURL: state_currentUser.photoURL
          },
          [combinedId + ".date"]: serverTimestamp(),
        });

        // create user chats
      }
    } catch (err) {}

    setUser(null);
    setUsername("");
  };

  const handleUserSelect = (u) => {
    dispatch({ type: "CHANGE_USER", payload: u });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    // console.log('data.chatId',data.chatId)
    await updateDoc(doc(db, "chats", data.chatId), {
      messages: arrayUnion({
        id: uuid(),
        text,
        senderId: state_currentUser.uid,
        date: Timestamp.now(),
      }),
    });

    await updateDoc(doc(db, "userChats", state_currentUser.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
        date: Timestamp.now()
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    await updateDoc(doc(db, "userChats", data.user.uid), {
      [data.chatId + ".lastMessage"]: {
        text,
        date: Timestamp.now()
      },
      [data.chatId + ".date"]: serverTimestamp(),
    });

    setText("");
  };
  

  const formatWhatsAppTimestamp = (timestamp) => {
    const messageDate = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
  
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Get the start of the current day
  
    if (messageDate >= today) {
      // If the message is from today, display time only
      const hours = messageDate.getHours();
      const minutes = messageDate.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    //   setTime(`Today, ${formattedTime}`);
      return `Today, ${formattedTime}`;
    } else {
      // If the message is from a different day, display date and time
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
    //   setTime(messageDate.toLocaleString('en-US', options));
      return messageDate.toLocaleString('en-US', options);
      
    }
  }


  const lastSeenFunction = (timestamp) => {
    const messageDate = new Date(timestamp * 1000); // Convert Unix timestamp to milliseconds
  
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Get the start of the current day
  
    if (messageDate >= today) {
      // If the message is from today, display time only
      const hours = messageDate.getHours();
      const minutes = messageDate.getMinutes();
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const formattedTime = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')} ${ampm}`;
      console.log('formattedTime ----- ',formattedTime)
      // return `Today, ${formattedTime}`;
    } else {
      // If the message is from a different day, display date and time
      const options = { year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' };
      console.log('options ----- ',formattedTime)
      // return messageDate.toLocaleString('en-US', options);
      
    }
  }

//   console.log('Time --------',formatWhatsAppTimestamp)

  const logout = () => {
    signOut(auth)
      .then((res) => {
        console.log("Logout Successfully ----- ", res);
        router.push("./login");
        // Sign-out successful.
      })
      .catch((error) => {
        console.log("Logout error -----", error);
        // An error happened.
      });
  };

  console.log('User ----- ', data.user.date)

  return (
    <div>
      <div>
        <div className="w-full h-32 bg-[#449388]"></div>

        <div className="container mx-auto -mt-32">
          <div className="py-6 h-screen">
            <div className="flex border  rounded shadow-md h-full">
              <div className="w-1/3 border flex flex-col">
                <div className="py-2 px-3 bg-grey-lighter flex flex-row justify-between items-center">
                  <div className="flex items-center">
                    <img
                      className="w-10 h-10 rounded-full"
                      src={
                        state_currentUser ? state_currentUser.photoURL : null
                      }
                    />
                    <p className="ml-2 font-bold text-grey">
                      {state_currentUser ? state_currentUser.displayName : null}
                    </p>
                    
                  </div>

                  <div className="flex">
                    <div className="ml-4">
                      <Button color="default" onClick={logout}>
                        Logout
                      </Button>
                      {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"><path fill="#263238" fillOpacity=".6" d="M12 7a2 2 0 1 0-.001-4.001A2 2 0 0 0 12 7zm0 2a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 9zm0 6a2 2 0 1 0-.001 3.999A2 2 0 0 0 12 15z"></path></svg> */}
                    </div>
                  </div>
                </div>

                <div className="py-2 px-2 bg-grey-lightest">
                  <input
                    type="text"
                    className="w-full px-2 py-2 text-sm"
                    placeholder="Search or start new chat"
                    onKeyDown={handleKey}
                    onChange={handleSearchState}
                    value={username}
                  />
                </div>

                <div className="bg-grey-lighter flex-1 overflow-auto">
                  {err && <span>User not found!</span>}
                  {user && (
                    <div
                      className="px-3 flex items-center bg-grey-light cursor-pointer"
                      onClick={handleSelect}
                    >
                      <div>
                        <img
                          className="h-12 w-12 rounded-full"
                          src={user.photoURL}
                        />
                      </div>
                      <div className="ml-4 flex-1 border-b border-grey-lighter py-4">
                        <p className="text-grey-darkest">{user.name}</p>
                        {/* <p className="text-grey-darkest">last seen</p> */}
                      </div>
                    </div>
                  )}

                  {
                //   Object.entries(chats).length == 0 ? null : 
                    Object.entries(chats)?.sort((a, b) => b[1].date - a[1].date)
                    .map((chat) =>
                     (
                      <div
                        key={chat[0]}
                        onClick={() => {
                          handleUserSelect(chat[1].userInfo);
                        }}
                        className="px-3 flex items-center bg-grey-light cursor-pointer"
                      >
                        <div>
                          <img
                            className="h-12 w-12 rounded-full"
                            src={chat[1].userInfo.photoURL}
                          />
                        </div>
                        <div className="ml-4 flex-1 border-b border-grey-lighter py-4">
                          <div className="flex items-bottom justify-between">
                            <p className="text-grey-darkest">
                              {chat[1].userInfo.displayName}
                            </p>
                            <p className="text-xs text-grey-darkest">
                                
                              {formatWhatsAppTimestamp(chat[1].lastMessage ? chat[1].lastMessage.date.seconds : null)}
                            </p>
                          </div>
                          <p className="text-grey-dark mt-1 text-sm">
                            {!chat[1].lastMessage
                              ? null
                              : chat[1].lastMessage.text}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

                              {
                                state_Check ?  (
                                  null
                                ) : (
                                  null
                                )
                              }
              

              <div className="w-2/3 border flex flex-col">
                <div className="py-2 px-3 bg-grey-lighter flex flex-row justify-between items-center">
                  <div className="flex items-center">
                    <div>
                      <img
                        className="w-10 h-10 rounded-full"
                        src={data.user?.photoURL}
                      />
                    </div>
                    <div className="ml-4">
                      <p className="text-grey-darkest">
                        {data.user?.displayName}
                      </p>
                      {
                        messages.length > 0 || messages.length == undefined
                        ? 
                        messages.messages.map((item) =>
                            item.senderId !== state_currentUser?.uid ? (
                            <p className="text-grey-darkest">
                                {lastSeenFunction(item.date.seconds)}
                            </p>
                        ) : null,
                        ) : null

                      }
                      
                     
                      
                     
                    </div>
                  </div>
                </div>

                <div className="flex-1 overflow-auto bg-[#DAD3CC]">
                  <div className="py-2 px-3">
                    <div className="flex justify-center mb-2">
                      <div className="rounded py-2 px-4 bg-[#DDECF2]">
                        <p className="text-sm uppercase">February 20, 2018</p>
                      </div>
                    </div>

                    <div className="flex justify-center mb-4">
                      <div className="rounded py-2 px-4 bg-[#FCF4CB]">
                        <p className="text-xs">
                          Messages to this chat and calls are now secured with
                          end-to-end encryption. Tap for more info.
                        </p>
                      </div>
                    </div>

                    {
                      messages.length > 0 || messages.length == undefined
                        ? messages.messages.map((item) =>
                            item.senderId === state_currentUser?.uid ? (
                              <div
                              ref={ref}
                                key={item.id}
                                className="flex justify-end mb-2"
                              >
                                <div className="rounded py-2 px-3 bg-[#E2F7CB]">
                                  <p className="text-sm mt-1">{item.text}</p>
                                  <p className="text-right text-xs text-grey-dark mt-1">
                                   {formatWhatsAppTimestamp( item.date.seconds )}
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div  ref={ref} key={item.id} className="flex mb-2">
                                <div className="rounded py-2 px-3 bg-[#F2F2F2]">
                                  <p className="text-sm mt-1">{item.text}</p>
                                  <p className="text-right text-xs text-grey-dark mt-1">
                                  {formatWhatsAppTimestamp( item.date.seconds )}
                                  </p>
                                </div>
                              </div>
                            )
                          )
                        : null
                    }
                  </div>
                </div>
                
                <form onSubmit={handleSend}>
                <div className="bg-grey-lighter px-4 py-4 flex items-center">
                  
                  <div className="flex-1 justify-end mx-4">
                    <input
                    required
                      value={text}
                      className="w-full border rounded px-2 py-2"
                      type="text"
                      onChange={(e) => setText(e.target.value)}
                    />
                    
                  </div>
                  <button type="submit" 
                  >
                    Send
                </button>
                 
                </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
