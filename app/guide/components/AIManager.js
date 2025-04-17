"use client";
import React from "react";
import {
  Card,
  CardBody,
  Button,
  ButtonGroup,
  Textarea,
  cn,
  CardHeader,
  CardFooter,
  Accordion,
  AccordionItem,
} from "@nextui-org/react";
import { AiOutlineShrink } from "react-icons/ai";
import { AiOutlineExpandAlt } from "react-icons/ai";
import { MdOutlineEdit } from "react-icons/md";
import { FaWandMagicSparkles } from "react-icons/fa6";
import TextInputs from "./TextInputs";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@nextui-org/react";
import { useState, useEffect } from "react";
import Conversation from "./conversation";
import { v4 as uuidv4 } from 'uuid';
import Image from "next/image";
import { useLanguageStore } from "@/app/components/languageStore";
import { dictionary } from "@/app/dictionary/dictionary";

function AIManager({ reference, setReference, selectedText, setSelectedText, chatReference, setChatReference }) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [selectedReferenceFileName, setSelectedReferenceFileName] =
    useState(null);
  const [selectedReferencePageName, setSelectedReferencePageName] =
    useState(null);
  const [selectedReferenceContext, setSelectedReferenceContext] =
    useState(null);
  const [chatList, setChatList] = useState([]);
  const [answerList, setAnswerList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [writeLonger, setWriteLonger] = useState(false);
  const [writeShorter, setWriteShorter] = useState(false);
  const [refineSentence, setRefineSentence] = useState(false);
  const [selectedQuestionSeq, setSelectedQuestionSeq] = useState(null);
  
  const [currentChatId, setCurrentChatId] = useState(null);
  const { language } = useLanguageStore();


  useEffect(() => {
    const chatContainer = document.querySelector(".chat-container");
    if (chatContainer) {
      chatContainer.scrollTop = chatContainer.scrollHeight;
    }
  }, [chatList, answerList]);

  // console.log("reference:", reference);

  useEffect(() => {
    if (selectedText.includes(dictionary.guide.smallTitle1[language])) {
      setSelectedQuestionSeq(0);
    } else if (selectedText.includes(dictionary.guide.smallTitle2[language])) {
      setSelectedQuestionSeq(1);
    } else if (selectedText.includes(dictionary.guide.smallTitle3[language])) {
      setSelectedQuestionSeq(2);
    }
  }, [selectedText]);

  useEffect(() => {
    if (currentChatId) {
      const currentChat = chatList.find(chat => chat.chatId === currentChatId);
      if (currentChat && currentChat.context) {
        setChatReference(currentChat.context);
      }
    }
  }, [currentChatId, chatList]);

  return (
    <div className="grid grid-rows-12 w-full h-[calc(100vh-11rem)]">
      <div className="row-span-2 w-full h-full flex flex-col gap-y-2">
        <Card className="bg-gray-200 w-full flex flex-col justify-center p-2">
          <div className="flex flex-col gap-y-2">
            <p className="text-center">
              {dictionary.guide.AIManagerInstruction1[language]}
            </p>
            <p className="text-center">
              {dictionary.guide.AIManagerInstruction2[language]}
            </p>
          </div>
        </Card>
        <div className="flex flex-row gap-x-5 w-full justify-between py-2">
          <Button
            variant="bordered"
            startContent={<Image src="/function/icon_3.png" alt="copy" width={20} height={20} />}
            className=""
            onPress={() => setWriteLonger((prev) => !prev)}
          >
            {dictionary.guide.write1[language]}
          </Button>
          <Button
            variant="bordered"
            startContent={<Image src="/function/icon_2.png" alt="copy" width={20} height={20} />}
            className=""
            onPress={() => setWriteShorter((prev) => !prev)}
          >
            {dictionary.guide.write2[language]}
          </Button>
          <Button
            variant="bordered"
            startContent={<Image src="/function/icon_4.png" alt="copy" width={20} height={20} />}
            className=""
            onPress={() => setRefineSentence((prev) => !prev)}
          >
            {dictionary.guide.write3[language]}
          </Button>
        </div>
      </div>
      <div className="row-span-7 w-full flex flex-col gap-y-2 overflow-hidden">
        <div className="h-full overflow-y-auto flex-1 chat-container">
          {chatList.length === 0 && (
            <>
              <div className="w-full border border-gray-100 p-2 rounded-lg flex flex-row gap-x-2">
                
                <p className="text-start text-sm">
                  {dictionary.guide.writeInstruction1[language]}
                </p>
              </div>
              <div className="w-full p-1 ">
                <Button
                  className="bg-white text-start text-sm text-[#247ee3] hover:text-[#4499ff] cursor-pointer transition-colors"
                  onClick={() =>
                    setChatList([
                      ...chatList,
                      {
                        role: "user",
                        message:
                          dictionary.guide.writeInstruction2[language],
                        chatId: uuidv4()
                      },
                    ])
                  }
                >
                  {dictionary.guide.writeInstruction2[language]}
                </Button>
              </div>
              <div className="w-full p-1 ">
                <Button
                  className="bg-white text-start text-sm text-[#247ee3] hover:text-[#4499ff] cursor-pointer transition-colors"
                  onClick={() =>
                    setChatList([
                      ...chatList,
                      {
                        role: "user",
                        message:
                          dictionary.guide.writeInstruction3[language],
                        chatId: uuidv4()
                      },
                    ])
                  }
                >
                  {dictionary.guide.writeInstruction3[language]}
                </Button>
              </div>
            </>
          )}
          {chatList.length > 0 && (
            <Conversation
              chatList={chatList}
              answerList={answerList}
              isLoading={isLoading}
              currentChatId={currentChatId}
              setCurrentChatId={setCurrentChatId}
            />
          )}
        </div>
      </div>
      <div className="row-span-3 w-full flex flex-col justify-end z-50">
        <Accordion
          isCompact
          className="w-full mb-2 bg-gray-100 text-sm border-2 border-gray-200 rounded-lg"
        >
          <AccordionItem
            className="w-full text-sm"
            title={
              <span className="text-sm">
                {dictionary.guide.checkReference[language]}
              </span>
            }
          >
            <div className="max-h-[30vh] overflow-y-auto">
              {chatReference.length > 0 ? (
                chatReference.map((item, index) => (
                  <div key={index} className="flex flex-col space-y-2 p-2">
                    <Button
                      variant="bordered"
                      size="sm"
                      onPress={() => {
                        setSelectedReferenceFileName(item.fileName);
                        setSelectedReferencePageName(item.pageName);
                        setSelectedReferenceContext(item.context);
                        onOpen();
                      }}
                    >
                      {dictionary.guide.number[language]}: [{item.referenceIdx}] / {dictionary.guide.fileName[language]}: {item.fileName} /
                      {dictionary.guide.pageName[language]}: {item.pageName}
                    </Button>
                  </div>
                ))
              ) : (
                reference
                  .filter((item) => item.questionSeq === selectedQuestionSeq)
                  .map((item, index) => (
                    <div key={index} className="flex flex-col space-y-2 p-2">
                      <Button
                        variant="bordered"
                        size="sm"
                        onPress={() => {
                          setSelectedReferenceFileName(item.fileName);
                          setSelectedReferencePageName(item.pageName);
                          setSelectedReferenceContext(item.context);
                          onOpen();
                        }}
                      >
                        {dictionary.guide.number[language]}: [{item.referenceIdx}] / {dictionary.guide.fileName[language]}: {item.fileName} /
                        {dictionary.guide.pageName[language]}: {item.pageName}
                      </Button>
                    </div>
                  ))
              )}
            </div>
          </AccordionItem>
        </Accordion>
        <TextInputs
          chatList={chatList}
          setChatList={setChatList}
          answerList={answerList}
          setAnswerList={setAnswerList}
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
        />
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <p className="text-xl font-bold">{dictionary.guide.checkReference[language]}</p>
                <hr className="my-2" />
                <p className="font-medium">
                  {dictionary.guide.fileName[language]}: {selectedReferenceFileName}
                </p>
                <p className="font-medium">
                  {dictionary.guide.pageName[language]}: {selectedReferencePageName}
                </p>
              </ModalHeader>
              <ModalBody className="max-h-[50vh] overflow-y-auto">
                <p className="text-xl font-bold">{dictionary.guide.contents[language]}</p>
                <p>{selectedReferenceContext}</p>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" onPress={onClose}>
                  {dictionary.guide.confirm[language]}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default AIManager;
