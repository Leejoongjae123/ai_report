"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Avatar,
  ScrollShadow,
  Listbox,
  ListboxItem,
  ListboxSection,
  Spacer,
  useDisclosure,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Switch,
  cn,
  ButtonGroup,
} from "@nextui-org/react";
import { FaChevronLeft } from "react-icons/fa6";
import { FaChevronRight } from "react-icons/fa6";
import AIManager from "./components/AIManager";
import dynamic from "next/dynamic";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ListboxWrapper } from "./components/ListboxWrapper";
import { sampleText } from "./components/sampleText";
import {
  Tabs,
  Tab,
  Input,
  Link,
  Button,
  Card,
  CardBody,
  CardHeader,
} from "@nextui-org/react";
import { Accordion, AccordionItem } from "@nextui-org/react";
import TipTap from "../components/TipTap";
import { dummyData } from "./components/guide";
import { guideText } from "./components/guideText";
import AIAnalysis from "./components/AIAnalysis";
import { createClient } from "@/utils/supabase/client";
import { question } from "./components/question";
import axios from "axios";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Spinner,
} from "@nextui-org/react";
import Lottie from "lottie-react";
import animationData from "@/public/lottie/ai.json";
import ConfettiEffect from "./components/ConfettiEffect";
import Image from "next/image";
import { useLanguageStore } from "@/app/components/languageStore";
import { dictionary } from "@/app/dictionary/dictionary";
function Page() {
  const [selected, setSelected] = useState("AI 매니저");
  const [content, setContent] = useState({ guide: "", sample: "" });
  const [selectedItem, setSelectedItem] = useState("weather");
  const [selectedText, setSelectedText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("kr");
  const [category, setCategory] = useState("");
  const [guideContents, setGuideContents] = useState(null);
  const [selectedKeys, setSelectedKeys] = useState(new Set(["edk"]));
  const [sampleContents, setSampleContents] = useState(null);
  const [sampleStep, setSampleStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [answer, setAnswer] = useState([]);
  const [reference, setReference] = useState([]);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [isLoadingAIAnalysis, setIsLoadingAIAnalysis] = useState(true);
  const [analysis, setAnalysis] = useState([]);
  const [currentText, setCurrentText] = useState([]);
  const requestMadeRef = useRef(false);
  const [chatReference, setChatReference] = useState([]);
  const { language, setLanguage } = useLanguageStore();
  
  useEffect(() => {
    if (language === "korean") {
      setSelectedLanguage("kr");
    } else {
      setSelectedLanguage("en");
    }
  }, [language]);
  console.log("language:",language)
  console.log("selectedLanguage:",selectedLanguage)


  useEffect(() => {
    if (answer.length > 2) {
      setCurrentText(answer);
    }
  }, [answer]);


  const handleFirstQuestion = async () => {
    if (answer.length > 0 || requestMadeRef.current) return;

    requestMadeRef.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const bucketIdParam = urlParams.get("bucketId");
    const bucketIds = bucketIdParam ? bucketIdParam.split("&") : [];

    try {
      setIsLoading(true);
      const ENDPOINT = "/api/v2/answer";
      const questions = [
        language === "korean" ? question.question1 : question.question4,
        question.question2,
        question.question3,
      ];
      console.log('questions222:',questions)

      if (
        !process.env.NEXT_PUBLIC_SCIONIC_BASE_URL ||
        !process.env.NEXT_PUBLIC_SCIONIC_API_KEY
      ) {
        throw new Error("API configuration is missing");
      }

      // 각 질문에 순서 정보를 포함
      const questionsWithSeq = questions.map((questionText, index) => ({
        text: questionText,
        seq: index,
      }));

      const promises = questionsWithSeq.map(
        ({ text, seq }, index) =>
          new Promise((resolve) => {
            setTimeout(async () => {
              const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SCIONIC_BASE_URL}${ENDPOINT}`,
                {
                  question: text,
                  bucketIds: bucketIds,
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                    "storm-api-key":
                      language === "korean"
                        ? process.env.NEXT_PUBLIC_SCIONIC_API_KEY
                        : process.env.NEXT_PUBLIC_SCIONIC_API_KEY_ENGLISH,
                  },
                }
              );
              // 응답과 함께 원래 순서 정보를 포함
              resolve({ response, questionSeq: seq });
            }, index * 500);
          })
      );

      const responses = await Promise.all(promises);

      const answers = responses.map(({ response, questionSeq }) => ({
        answer: response.data.data.chat.answer
          .replace(/#/g, "")
          .replace(/\[\[([\d\s\w]+)\]\]/g, "[$1]"),
        questionSeq,
      }));

      answers.sort((a, b) => a.questionSeq - b.questionSeq);
    

      const references = responses.flatMap(({ response, questionSeq }) =>
        response.data.data.contexts.map(
          ({ fileName, pageName, context, referenceIdx }) => ({
            fileName,
            pageName,
            context,
            referenceIdx,
            questionSeq,
          })
        )
      );

      // references도 questionSeq 기준으로 정렬하려면 아래 코드 추가
      references.sort((a, b) => a.questionSeq - b.questionSeq);
       
      setAnswer(answers);
      setReference(references);
    } catch (error) {
      console.error("API Error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      alert(`데이터를 불러오는데 실패했습니다: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSecondQuestion = async (input = null) => {
    console.log("input:", input);
    try {
      setIsLoadingAIAnalysis(true);
      const ENDPOINT = "/api/v2/answer";

      // input과 answer가 모두 없는 경우 처리
      if (!input && (!answer || answer.length === 0)) {
        console.log("No input or answer available");
        return;
      }

      // 안전하게 문자열 생성
      let questions = [
        `Here is the content generated for the "(1) 이사회의 역할 및 책임" Part.${
          (input && input[0]) || (answer && answer[0].answer) || ""
        }Evaluate the above content using the given QA Evaluation Criteria and ONLY the "(1) 이사회의 역할 및 책임" Part.`,
        `Here is the content generated for the "(2) 관리 감독 체계" Part.${
          (input && input[1]) || (answer && answer[1].answer) || ""
        }Evaluate the above content using the given QA Evaluation Criteria and ONLY the "(2) 관리 감독 체계" Part.`,
        `Here is the content generated for the "(3) 경영진의 역할 및 감독 프로세스" Part.${
          (input && input[2]) || (answer && answer[2].answer) || ""
        }Evaluate the above content using the given QA Evaluation Criteria and ONLY the "(3) 경영진의 역할 및 감독 프로세스" Part.
        `,
      ];

      console.log("questions:", questions);

      if (
        !process.env.NEXT_PUBLIC_SCIONIC_BASE_URL ||
        !process.env.NEXT_PUBLIC_SCIONIC_API_KEY_AI_ANALYSIS
      ) {
        throw new Error("API configuration is missing");
      }

      console.log("questions:", questions);

      // 각 요청을 Promise 배열로 만들되, 딜레이를 포함
      const promises = questions.map(
        (questionText, index) =>
          new Promise((resolve) => {
            // 각 요청 사이에 500ms 딜레이
            setTimeout(async () => {
              const response = await axios.post(
                `${process.env.NEXT_PUBLIC_SCIONIC_BASE_URL}${ENDPOINT}`,
                {
                  question: questionText,
                },
                {
                  headers: {
                    "Content-Type": "application/json",
                    "storm-api-key": 
                      language === "korean"
                        ? process.env.NEXT_PUBLIC_SCIONIC_API_KEY_AI_ANALYSIS
                        : process.env.NEXT_PUBLIC_SCIONIC_API_KEY_AI_ANALYSIS_ENGLISH,
                  },
                }
              );
              resolve(response);
            }, index * 500); // 각 요청마다 500ms 간격
          })
      );

      const responses = await Promise.all(promises);

      const analysis = responses.map(
        (response) => response.data.data.chat.answer
      );

      setAnalysis(analysis);
    } catch (error) {
      console.error("API Error:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
      }
      alert(`데이터를 불러오는데 실패했습니다22: ${error.message}`);
    } finally {
      setIsLoadingAIAnalysis(false);
    }
  };

  useEffect(() => {
    if (answer.length > 0) {
      handleSecondQuestion();
    }
  }, [answer]);

  useEffect(() => {
    handleFirstQuestion();
    onOpen();
  }, []);

  const selectedValue = useMemo(
    () => Array.from(selectedKeys).join(", "),
    [selectedKeys]
  );

  const handleContentChange = () => {
    const selectedData = dummyData.find((item) => item.label === category);
    if (selectedData) {
      setContent({ guide: selectedData.guide, sample: selectedData.sample });
    } else {
      setContent({ guide: "", sample: "" });
    }
  };
  useEffect(() => {
    handleContentChange();
  }, [category]);

  const guideRef = useRef(null);

  useEffect(() => {
    if (guideRef.current) {
      const selectedElement = guideRef.current.querySelector(".is-selected");
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }
    }
  }, [selectedText]);

  useEffect(() => {
    const selectedGuide = guideText.find(
      (item) => item.lan === selectedLanguage && item.title === selectedItem
    );
    if (selectedGuide) {
      setGuideContents(selectedGuide.description);
    } else {
      setGuideContents(null);
    }
  }, [selectedLanguage, selectedItem]);

  // console.log('selectedItem:',selectedItem)
  // console.log("sampleText:",sampleText)
  // console.log("category:",category)
  console.log('selectedItem:',selectedItem)
  console.log('selectedKeys:',selectedKeys)
  console.log("sampleText:",sampleText)
  useEffect(() => {
    const selectedSample = sampleText.find(
      (item) =>
        item.title === selectedItem &&
        selectedKeys.has(item.key) &&
        item.text === category
    );
    if (selectedSample) {
      setSampleContents(selectedSample);
    } else {
      setSampleContents(null);
    }
  }, [selectedItem, selectedKeys, category]);

  useEffect(() => {
    return () => {
      localStorage.removeItem("questionRequestMade");
    };
  }, []);

  console.log('selectedText:',selectedText)

  return (
    <div className="w-full h-full grid grid-cols-6 gap-4">
      {/* {!isLoading && <ConfettiEffect />} */}
      <div className="col-span-1 border-r px-5">
        <ScrollShadow className="-mr-6 h-full max-h-full pr-6 ">
          <Listbox aria-label="Recent chats" variant="flat">
            <ListboxSection
              classNames={{
                base: "py-0 space-y-5 w-full flex-1 justify-center items-center",
                heading: "py-0 pl-[10px] text-small text-default-400",
              }}
            >
              <ListboxItem
                key="email-template"
                className=" my-3 group h-12 text-gray-400 bg-gray-100 rounded-lg"
                textValue="General Requirements"
                endContent={
                  <FaChevronRight className="text-gray-400 text-medium" />
                }
              >
                {dictionary.guide.governance[language]}
              </ListboxItem>

              <ListboxItem
                key="custom-support-message"
                className="my-5 group h-16 text-[#1c9ea6] rounded-lg ml-5 hover:none "
                textValue="Governance"
                onClick={() => setSelectedItem("weather")}
              >
                <p
                  className={cn(
                    "text-sm pr-5",
                    selectedItem === "weather" && "font-bold"
                  )}
                >
                  {dictionary.guide.governance1[language]}
                </p>
              </ListboxItem>
              <ListboxItem
                key="resignation-letter"
                className="my-5 group h-16 text-[#1c9ea6] rounded-lg ml-5 "
                textValue="Strategy"
                onClick={() => setSelectedItem("manager")}
              >
                <p
                  className={cn(
                    "text-sm pr-5",
                    selectedItem === "manager" && "font-bold"
                  )}
                >
                  {dictionary.guide.governance2[language]}
                </p>
              </ListboxItem>

              <ListboxItem
                key="email-template"
                className=" my-5 group h-12 text-gray-400 bg-gray-100 rounded-lg"
                textValue="General Requirements"
              >
                {dictionary.guide.strategy[language]}
              </ListboxItem>

              <ListboxItem
                key="react-19-example"
                className=" my-5 group h-12 text-gray-400 bg-gray-100 rounded-lg"
                textValue="Climate-related Disclosures"
              >
                {dictionary.guide.riskManagement[language]}
              </ListboxItem>
              <ListboxItem
                key="how-a-taximeter-works"
                className=" my-5 group h-12 text-gray-400 bg-gray-100 rounded-lg"
                textValue="Appendix"
              >
                {dictionary.guide.metric[language]}
              </ListboxItem>
              <ListboxItem
                key="custom-support-message2"
                className="my-5 group h-12 text-[#1c9ea6] rounded-lg ml-5 hover:none"
                textValue="Indicator"
                onClick={() => setSelectedItem("indicator")}
              >
                <p
                  className={cn(
                    "text-sm pr-5",
                    selectedItem === "indicator" && "font-bold"
                  )}
                >
                  {dictionary.guide.metric1[language]}
                </p>
              </ListboxItem>
            </ListboxSection>
          </Listbox>
        </ScrollShadow>
      </div>
      <PanelGroup direction="horizontal" className="col-span-5">
        <Panel defaultSize={60} minSize={30}>
          <div className="overflow-y-auto h-full">
            <TipTap
              category={category}
              setCategory={setCategory}
              selectedItem={selectedItem}
              selectedText={selectedText}
              setSelectedText={setSelectedText}
              answer={answer}
              currentText={currentText}
              setCurrentText={setCurrentText}
              chatReference={chatReference}
              setChatReference={setChatReference}
            ></TipTap>
            
          </div>
        </Panel>
        <PanelResizeHandle className="w-1 flex items-center justify-center">
          <div className="w-1 h-8 bg-gray-300 rounded-full hover:bg-gray-400 transition-colors" />
        </PanelResizeHandle>
        <Panel defaultSize={40} minSize={30}>
          <div className="flex flex-col w-full h-full p-1">
            <Card className="flex-1 shadow-none border border-gray-300">
              <CardBody className="overflow-hidden">
                <Tabs
                  fullWidth
                  size="md"
                  aria-label="Tabs form"
                  selectedKey={selected}
                  onSelectionChange={setSelected}
                  variant="underlined"
                  classNames={{
                    // tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
                    cursor: "w-full bg-[#f25b2b]",
                    // tab: "max-w-fit px-0 h-12",
                    // tabContent: "group-data-[selected=true]:text-[#f25b2b]"
                  }}
                >
                  <Tab
                    className="w-full h-full "
                    key="AI 매니저"
                    title={dictionary.guide.AIManager[language]}
                  >
                    <AIManager
                      className="w-full h-full"
                      reference={reference}
                      setReference={setReference}
                      selectedText={selectedText}
                      setSelectedText={setSelectedText}
                      chatReference={chatReference}
                      setChatReference={setChatReference}
                    ></AIManager>
                  </Tab>
                  <Tab
                    className="w-full h-full"
                    key="AI 진단"
                    title={dictionary.guide.AIDiagnosis[language]}
                  >
                    <AIAnalysis
                      selectedText={selectedText}
                      setSelectedText={setSelectedText}
                      analysis={analysis}
                      setAnalysis={setAnalysis}
                      isLoadingAIAnalysis={isLoadingAIAnalysis}
                      setIsLoadingAIAnalysis={setIsLoadingAIAnalysis}
                      handleSecondQuestion={handleSecondQuestion}
                      currentText={currentText}
                      setCurrentText={setCurrentText}
                      className="w-full h-full"
                    ></AIAnalysis>
                  </Tab>
                  <Tab
                    key="가이드"
                    title={dictionary.guide.guide[language]}
                    className=""
                  >
                    <Accordion
                      variant="splitted"
                      defaultExpandedKeys={["1", "2"]}
                    >
                      <AccordionItem
                        key="1"
                        aria-label="Accordion 1"
                        title={
                          <div className="flex items-center justify-between ㄹ">
                            <strong>{dictionary.guide.seeGuide[language]}</strong>
                            <Switch
                              size="sm"
                              isSelected={selectedLanguage === "en"}
                              onChange={() =>
                                setSelectedLanguage(
                                  selectedLanguage === "kr" ? "en" : "kr"
                                )
                              }
                            >
                              <p className="text-xs">
                                {selectedLanguage === "kr"
                                  ? dictionary.guide.toKorean[language]
                                  : dictionary.guide.toEnglish[language]}
                              </p>
                            </Switch>
                          </div>
                        }
                        className=""
                      >
                        <div
                          className="overflow-y-auto max-h-[30vh]"
                          ref={guideRef}
                        >
                          <h1 className="guide_title_kr text-lg font-semibold">
                            {guideContents?.title}
                          </h1>
                          <br />
                          <p className={`guide_base_kr`}>
                            <div
                              dangerouslySetInnerHTML={{
                                __html: guideContents?.base,
                              }}
                            />{" "}
                          </p>
                          <br />
                          <p
                            className={`guide_ga_kr ${
                              selectedText.includes("(가)") ? "is-selected" : ""
                            }`}
                          >
                            {guideContents?.ga}
                          </p>
                          <br />
                          <p
                            className={`guide_na_kr ${
                              selectedText.includes("(나)") ? "is-selected" : ""
                            }`}
                          >
                            {guideContents?.na}
                          </p>
                          <br />
                          <p
                            className={`guide_da_kr ${
                              selectedText.includes("(다)") ? "is-selected" : ""
                            }`}
                          >
                            {guideContents?.da}
                          </p>
                          <br />

                          <p
                            className={`guide_ra_kr ${
                              selectedText.includes("(라)") ? "is-selected" : ""
                            }`}
                          >
                            {guideContents?.ra}
                          </p>
                          <br />

                          <p
                            className={`guide_ma_kr ${
                              selectedText.includes("(마)") ? "is-selected" : ""
                            }`}
                          >
                            {guideContents?.ma}
                          </p>
                        </div>
                      </AccordionItem>
                      <AccordionItem
                        key="2"
                        aria-label="Accordion 2"
                        title={<strong>{dictionary.guide.seeSample[language]}</strong>}
                      >
                        <div className="overflow-y-auto max-h-[30vh]">
                          <ListboxWrapper className="w-full">
                            <Listbox
                              aria-label="Single selection example"
                              variant="flat"
                              disallowEmptySelection
                              selectionMode="single"
                              selectedKeys={selectedKeys}
                              onSelectionChange={(keys) => {
                                setSelectedKeys(keys);
                                setSampleStep(1); // Reset sample step to 1 for any selection
                              }}
                            >
                              <ListboxItem key="edkkor">
                                {dictionary.guide.samplesTitle1[language]}
                              </ListboxItem>
                              <ListboxItem key="edkeng">
                                {dictionary.guide.samplesTitle2[language]}
                              </ListboxItem>
                              <ListboxItem key="domestic">
                                {dictionary.guide.samplesTitle3[language]}
                              </ListboxItem>
                              <ListboxItem key="foreign">
                                {dictionary.guide.samplesTitle4[language]}
                              </ListboxItem>
                            </Listbox>
                          </ListboxWrapper>

                          <div className="text-sm p-3 pb-0">
                            <div
                              dangerouslySetInnerHTML={{
                                __html:
                                  sampleStep === 1
                                    ? sampleContents?.contents1
                                    : sampleContents?.contents2,
                              }}
                            />
                            <div className="flex flex-col justify-start items-start gap-2 my-3">
                              {sampleContents?.link1_1 && (
                                <div className="flex justify-start items-center gap-2 w-full">
                                  {(sampleStep === 1
                                    ? sampleContents.link1_1
                                    : sampleContents.link2_1) && (
                                    <>
                                      <p
                                        className="w-12 flex-shrink-0 whitespace-nowrap "
                                        color="primary"
                                      >
                                        보고서1
                                      </p>
                                      <div className="flex-grow truncate">
                                        <Link
                                          target="_blank"
                                          href={
                                            sampleStep === 1
                                              ? sampleContents.link1_1
                                              : sampleContents.link2_1
                                          }
                                          className="block truncate"
                                        >
                                          {sampleStep === 1
                                            ? sampleContents.link1_1
                                            : sampleContents.link2_1}
                                        </Link>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                              {sampleContents?.link1_2 && (
                                <div className="flex justify-start items-center gap-2 w-full">
                                  {(sampleStep === 1
                                    ? sampleContents.link1_2
                                    : sampleContents.link2_2) && (
                                    <>
                                      <p
                                        className="w-12 flex-shrink-0 whitespace-nowrap "
                                        color="primary"
                                      >
                                        보고서2
                                      </p>
                                      <div className="flex-grow truncate">
                                        <Link
                                          target="_blank"
                                          href={
                                            sampleStep === 1
                                              ? sampleContents.link1_2
                                              : sampleContents.link2_2
                                          }
                                          className="block truncate"
                                        >
                                          {sampleStep === 1
                                            ? sampleContents.link1_2
                                            : sampleContents.link2_2}
                                        </Link>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                              {sampleContents?.link1_3 && (
                                <div className="flex justify-start items-center gap-2 w-full">
                                  {(sampleStep === 1
                                    ? sampleContents.link1_3
                                    : sampleContents.link2_3) && (
                                    <>
                                      <p
                                        className="w-12 flex-shrink-0 whitespace-nowrap "
                                        color="primary"
                                      >
                                        전문
                                      </p>
                                      <div className="flex-grow truncate">
                                        <Link
                                          target="_blank"
                                          href={
                                            sampleStep === 1
                                              ? sampleContents.link1_3
                                              : sampleContents.link2_3
                                          }
                                          className="block truncate"
                                        >
                                          {sampleStep === 1
                                            ? sampleContents.link1_3
                                            : sampleContents.link2_3}
                                        </Link>
                                      </div>
                                    </>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {Array.from(selectedKeys).some(
                            (key) => key === "domestic" || key === "foreign"
                          ) && (
                            <ButtonGroup className="w-full justify-end p-3">
                              <Button
                                size="sm"
                                variant="flat"
                                onClick={() => setSampleStep(1)}
                                disabled={sampleStep === 1}
                              >
                                <FaChevronLeft />
                              </Button>
                              <Button
                                size="sm"
                                variant="flat"
                                onClick={() => setSampleStep(2)}
                                disabled={sampleStep === 2}
                              >
                                <FaChevronRight />
                              </Button>
                            </ButtonGroup>
                          )}
                        </div>
                      </AccordionItem>
                    </Accordion>
                  </Tab>
                </Tabs>
              </CardBody>
            </Card>
          </div>
        </Panel>
      </PanelGroup>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1"></ModalHeader>
              <ModalBody>
                <h1 className="text-2xl font-semibold text-center mb-4">
                  {dictionary.guide.completeInstruction1[language]}
                </h1>
                {isLoading ? (
                  <div className="flex justify-center items-center w-full h-full">
                    <Image
                      src="/lottie/loading.gif"
                      alt="loading"
                      width={300}
                      height={300}
                    ></Image>
                  </div>
                ) : null}
                <p
                  className={cn(
                    "text-center text-lg font-bold transition-transform duration-500 ease-in-out",
                    isLoading
                      ? "opacity-70 scale-100"
                      : "opacity-100 scale-110 text-primary text-2xl"
                  )}
                >
                  {isLoading ? null : dictionary.guide.completeInstruction4[language]}
                </p>
              </ModalBody>
              <ModalFooter className="mb-5">
                <div className="flex justify-center items-center gap-2 w-full">
                  <Button
                    variant="bordered"
                    color="primary"
                    onPress={() => {
                      window.location.reload();
                    }}
                  >
                    {dictionary.guide.completeInstruction2[language]}
                  </Button>
                  {isLoading ? null : (
                    <Button color="primary" onPress={onClose}>
                      {dictionary.guide.completeInstruction3[language]}
                    </Button>
                  )}
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default Page;
