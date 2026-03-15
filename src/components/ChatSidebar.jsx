"use client";

export default function ChatSidebar({chats,setActiveChat}){

  return(

    <div style={{
      width:250,
      borderRight:"1px solid #ddd",
      padding:20
    }}>

      <h3>Chats</h3>

      {chats.map(chat=>(
        <div
          key={chat.id}
          style={{cursor:"pointer",marginBottom:10}}
          onClick={()=>setActiveChat(chat.id)}
        >
          {chat.title}
        </div>
      ))}

    </div>

  );

}