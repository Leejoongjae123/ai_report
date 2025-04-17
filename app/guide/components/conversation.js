import React from "react";

import { userMessages, assistantMessages } from "./messages";

import MessageCard from "./message-card";
import Na from "./na";
import { Spinner } from "@nextui-org/react";
export default function Component({ chatList, isLoading, currentChatId, setCurrentChatId }) {
  return (
    <div className="flex flex-col gap-4 px-1">
      {chatList.map(({ role, message,category=null,chatId }, index) => (
        <MessageCard
          key={index}
          attempts={index === 1 ? 2 : 1}
          avatar={
            role === "assistant"
              ? "https://wjnyranqqnagprhqmoer.supabase.co/storage/v1/object/public/images/edk.png"
              : "/profile/profile.jpeg"
          }
          currentAttempt={index === 1 ? 2 : 1}
          message={category?category : message}
          messageClassName={
            role === "user" ? "bg-content3 text-content3-foreground" : ""
          }
          showFeedback={role === "assistant"}
          
          onClick={() => setCurrentChatId(chatId)}
        />
      ))}
      {isLoading && <Spinner color="primary" size="sm"></Spinner>}
      <div className="w-full h-12"></div>
    </div>
  );
}
