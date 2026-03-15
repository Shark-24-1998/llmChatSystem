"use client";

import { useState } from "react";

export default function MessageInput({onSend}){

  const [text,setText] = useState("");

  const send = () => {

    if(!text.trim()) return;

    onSend(text);
    setText("");

  };

  return(

    <div style={{display:"flex",marginTop:20}}>

      <input
        style={{flex:1}}
        value={text}
        onChange={e=>setText(e.target.value)}
      />

      <button onClick={send}>
        Send
      </button>

    </div>

  );

}