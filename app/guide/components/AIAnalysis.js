"use client";
import React, { useState, useEffect } from "react";
import { CircularProgress } from "@nextui-org/react";
import { Button } from "@nextui-org/react";
import { Textarea } from "@nextui-org/react";
import { Card } from "@nextui-org/react";
import { MdRefresh } from "react-icons/md";
import { dictionary } from "@/app/dictionary/dictionary";
import { useLanguageStore } from "@/app/components/languageStore";
import { Tooltip } from "@nextui-org/react";
import { IoMdInformationCircleOutline } from "react-icons/io";
import { IoMdInformationCircle } from "react-icons/io";

function AIAnalysis({
  currentText,
  setCurrentText,
  analysis,
  setAnalysis,
  isLoadingAIAnalysis,
  setIsLoadingAIAnalysis,
  handleSecondQuestion,
  selectedText,
}) {
  const [guideText, setGuideText] = useState("");
  const [analysisText, setAnalysisText] = useState("");
  const { language } = useLanguageStore();
  const formatAnalysisText = (text) => {
    if (!text) return "";
    
    let formattedText = text;
    
    if (language === 'english') {
      // Bold text between ** markers for English only
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<br/><br/><span>- </span><strong>$1</strong>");
      formattedText = formattedText.replace(/(?<!\w)\s*-\s*/g, "");
    }
    if (language === 'korean') {
      formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      formattedText = formattedText.replace(/(?<!\w)\s*-\s*/g, "<br/><br/>- ");
      
    }
    formattedText = formattedText.replace(/^(<br\/>)+/, '');

    
    // Replace - with line breaks for both languages

    
    return formattedText;
  };

  const handleGuideTextChange = () => {
    const categories = {
      [dictionary.guide.smallTitle1[language]]: [
        dictionary.guide.AIDiagnosisInstructionUpper1[language],
      ],
      [dictionary.guide.smallTitle2[language]]: [
        dictionary.guide.AIDiagnosisInstructionUpper2[language],
      ],
      [dictionary.guide.smallTitle3[language]]: [
        dictionary.guide.AIDiagnosisInstructionUpper3[language],
      ],
    };

    const matchedCategory = Object.keys(categories).find((category) =>
      selectedText?.includes(category)
    );

    if (matchedCategory) {
      setGuideText(categories[matchedCategory]);
    }
  };

  const handleAnalysisText = () => {
    const categories = [
      dictionary.guide.smallTitle1[language],
      dictionary.guide.smallTitle2[language],
      dictionary.guide.smallTitle3[language],
    ];

    const matchedCategory = categories.find((category) =>
      selectedText?.includes(category)
    );

    if (matchedCategory) {
      const index = categories.indexOf(matchedCategory);
      setAnalysisText(formatAnalysisText(analysis[index]));
    }
  };

  useEffect(() => {
    handleGuideTextChange();
    handleAnalysisText();
  }, [selectedText, isLoadingAIAnalysis]);

  return (
    <div className="grid grid-rows-3 gap-5 w-full h-full">
      <div className="row-span-1 flex flex-col gap-3">
        <div className='flex flex-row'>
          <h1 className="font-bold">
            {dictionary.guide.AIDiagnosisInstruction1[language]}
          </h1>
          <Tooltip
            className="z-50"
            content={
              <div>
                <p>{dictionary.guide.AIDiagnosisTooltip1[language]}</p>
              </div>
            }
          >
            <div>
            <IoMdInformationCircleOutline className="text-xs" />
            </div>
          </Tooltip>
        </div>

        {/* <div
          className="block p-2.5 w-full text-sm text-gray-900 bg-gray-100 rounded-lg border border-gray-300"
          dangerouslySetInnerHTML={{ __html: guideText }}
        /> */}
        <Card className="bg-gray-200 w-full flex flex-col justify-center p-2  overflow-y-auto py-5">
          <p
            className="text-start h-full overflow-y-auto text-sm"
            dangerouslySetInnerHTML={{ __html: guideText }}
          />
        </Card>
      </div>

      <div className="row-span-2 flex flex-col gap-3 justify-between items-center w-full h-full py-10">
        <div className="flex gap-3 justify-between items-center w-full">
          <div className="flex flex-row">
          <h1 className="font-bold">
            {dictionary.guide.AIDiagnosisInstruction2[language]}
          </h1>
          <Tooltip
            className="z-50"
            content={
              <div>
                <p>{dictionary.guide.AIDiagnosisTooltip2[language]}</p>
              </div>
            }
          >
            <div>
              <IoMdInformationCircleOutline className="text-xs" />
            </div>
          </Tooltip>
          </div>
          <div>
            <Button
              startContent={
                isLoadingAIAnalysis ? (
                  <div role="status">
                    <svg
                      aria-hidden="true"
                      className="w-5 h-5 text-gray-200 animate-spin dark:text-gray-600 fill-[#F25B2B]"
                      viewBox="0 0 100 101"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor"
                      />
                      <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill"
                      />
                    </svg>
                  </div>
                ) : (
                  <MdRefresh className="text-2xl font-bold" />
                )
              }
              disabled={isLoadingAIAnalysis}
              className="p-5"
              variant="bordered"
              onClick={() => handleSecondQuestion(currentText)}
            >
              <p>{dictionary.guide.again[language]}</p>
            </Button>
          </div>
        </div>

        <Card className="bg-gray-200 w-full flex flex-col p-2 h-full">
          <p
            className="text-start overflow-y-auto px-2 text-sm"
            dangerouslySetInnerHTML={{ __html: analysisText }}
          />
        </Card>
      </div>
    </div>
  );
}

export default AIAnalysis;
