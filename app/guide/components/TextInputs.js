"use client";

import React from "react";
import {Button, Tooltip} from "@nextui-org/react";
import {Icon} from "@iconify/react";
import {cn} from "@nextui-org/react";
import { v4 as uuidv4 } from 'uuid';
import PromptInput from "./prompt-input";

export default function TextInputs({chatList, setChatList, answerList, setAnswerList, isLoading, setIsLoading, reference, setReference, selectedText, setSelectedText, writeLonger, setWriteLonger, writeShorter, setWriteShorter, refineSentence, setRefineSentence, chatReference, setChatReference, currentChatId, setCurrentChatId}) {
  const [isRegenerating, setIsRegenerating] = React.useState(false);
  const [prompt, setPrompt] = React.useState("");

  const onRegenerate = () => {
    setIsRegenerating(true);

    setTimeout(() => {
      setIsRegenerating(false);
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setChatList([...chatList, {
      role: 'user',
      message: prompt,
      chatId: uuidv4()
    }]);
    setPrompt("");
  };
  console.log("chatList:",chatList);
  return (
    <div className="flex w-full flex-col gap-4">
      <form onSubmit={handleSubmit} className="flex w-full flex-col items-start rounded-medium bg-default-100 transition-colors hover:bg-default-200/70">
        <PromptInput
          chatList={chatList}
          setChatList={setChatList}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          reference={reference}
          setReference={setReference}
          selectedText={selectedText}
          setSelectedText={setSelectedText}
          writeLonger={writeLonger}
          writeShorter={writeShorter}
          refineSentence={refineSentence}
          setWriteLonger={setWriteLonger}
          setWriteShorter={setWriteShorter}
          setRefineSentence={setRefineSentence}
          chatReference={chatReference}
          setChatReference={setChatReference}
          currentChatId={currentChatId}
          setCurrentChatId={setCurrentChatId}
          classNames={{
            inputWrapper: "!bg-transparent shadow-none",
            innerWrapper: "relative",
            input: "pt-1 pl-2 pb-6 !pr-10 text-medium",
          }}
          
          endContent={
            <div className="flex items-end gap-2">
              <Tooltip showArrow content="Send message">
                <Button
                  isIconOnly
                  color={!prompt ? "default" : "primary"}
                  isDisabled={!prompt}
                  radius="lg"
                  size="sm"
                  variant="solid"
                  onClick={(e) => handleSubmit(e)}
                >
                  <Icon
                    className={cn(
                      "[&>path]:stroke-[2px]",
                      !prompt ? "text-default-600" : "text-primary-foreground",
                    )}
                    icon="solar:arrow-up-linear"
                    width={20}
                  />
                </Button>
              </Tooltip>
            </div>
          }
          minRows={3}
          radius="lg"
          value={prompt}
          variant="flat"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          onValueChange={setPrompt}
        />
      </form>
    </div>
  );
}
