"use client";

import React, { useState, useEffect } from "react";
import {
  Button,
  Textarea,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Checkbox,
  CheckboxGroup,
} from "@nextui-org/react";
import { cn } from "@nextui-org/react";
import { GoPlusCircle } from "react-icons/go";
import { useRouter, usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { useSearchParams } from "next/navigation";
import { Chip } from "@nextui-org/react";
import { Suspense } from "react";
import axios from "axios";
import { v4 as uuidv4 } from 'uuid';
import { dictionary } from "@/app/dictionary/dictionary";
import { useLanguageStore } from "@/app/components/languageStore";
const PromptInputContent = React.forwardRef(
  ({ classNames = {}, ...props }, ref) => {
    const supabase = createClient();
    const [buckets, setBuckets] = useState([]);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const [isReady, setIsReady] = useState(false);
    const [selectedBuckets, setSelectedBuckets] = useState([]);
    const { language } = useLanguageStore();

    useEffect(() => {
      const regarding=language==='korean'?'에 대하여':'Regarding this,';
          if (props.writeLonger) {
            props.setWriteLonger(false);
            props.setChatList([
              ...props.chatList,
              {
                role: 'user',
                message: props.selectedText+regarding+ dictionary.guide.QuickAIQuestion1[language],
                category:dictionary.guide.write1[language],
                chatId: uuidv4()

              }
            ]);
          } else if (props.writeShorter) {
            props.setWriteShorter(false);
            props.setChatList([
              ...props.chatList,
              {
                role: 'user',
                message: props.selectedText+regarding+ dictionary.guide.QuickAIQuestion2[language],
                category:dictionary.guide.write2[language],
                chatId: uuidv4()
                
              }
            ]);
          } else if (props.refineSentence) {
            props.setRefineSentence(false);
            props.setChatList([
              ...props.chatList,
              {
                role: 'user',
                message: props.selectedText+regarding+ dictionary.guide.QuickAIQuestion3[language],
                category:dictionary.guide.write3[language],
                chatId: uuidv4()
              }
            ]);
          }
    }, [props.writeLonger, props.writeShorter, props.refineSentence]);

    useEffect(() => {
      if (searchParams) {
        const params = searchParams
          .getAll("bucketId")
          .flatMap((param) => param.split("&"))
          .filter(Boolean);
        setSelectedBuckets(params);
        setIsReady(true);
      }
    }, [searchParams]);

    const fetchBucketsFromSupabase = async () => {
      const { data: existingBucket, error: fetchError } = await supabase
        .from("buckets")
        .select("*")
        .eq('language',language)

      if (existingBucket) {
        const processedBuckets = existingBucket
          .filter((bucket) => bucket.documents && bucket.documents.length > 0)
          .map((bucket) => ({
            bucketId: bucket.bucketId,
            documentName: bucket.documents[0].documentName || "제목 없음",
          }));
        setBuckets(processedBuckets);
      } else if (fetchError) {
        console.error("Error fetching bucket from Supabase:", fetchError);
      }
    };

    useEffect(() => {
      fetchBucketsFromSupabase();
    }, []);

    const handleQuery = async (chatList) => {
      if (chatList && chatList.length > 0) {
        const lastMessage = chatList[chatList.length - 1];
        
        const question = props.selectedText?.length > 1 
          // ? `${props.selectedText} ${lastMessage.message}`
          ? ` ${lastMessage.message}`
          : lastMessage.message;

        try {
          const response = await axios.post(
            process.env.NEXT_PUBLIC_SCIONIC_BASE_URL + "/api/v2/answer",
            {
              question: question,
              bucketIds: selectedBuckets,
            },
            {
              headers: {
                "storm-api-key": language === "korean" ? process.env.NEXT_PUBLIC_SCIONIC_API_KEY : process.env.NEXT_PUBLIC_SCIONIC_API_KEY_ENGLISH,
              },
            }
          );

          const answer = response.data.data.chat.answer;
          const references = response.data.data.contexts
            .map(({ fileName, pageName, context, referenceIdx }) => ({
              fileName,
              pageName,
              context,
              referenceIdx,
            }));

          props.setChatList([
            ...chatList,
            {
              role: "assistant",
              message: answer,
              chatId: uuidv4(),
              context: references
            },
          ]);

          props.setChatReference(references);

          props.setIsLoading(false);
        } catch (error) {
          console.error("Error fetching answer:", error);
        }
      }
    };

    useEffect(() => {
      if (props.chatList && props.chatList.length > 0) {
        const lastMessage = props.chatList[props.chatList.length - 1];
        if (lastMessage.role === "user") {
          handleQuery(props.chatList);
          props.setIsLoading(true);
        }
      }
    }, [props.chatList]);

    useEffect(() => {
      if (isReady && searchParams) {
        const params = new URLSearchParams(searchParams);
        params.delete("bucketId");
        params.append("bucketId", selectedBuckets.join("&"));

        router.push(`${pathname}?${params.toString()}`);
      }
    }, [selectedBuckets, isReady]);

    if (!isReady) {
      return null;
    }

    

    // console.log("selectedText:", props.selectedText)
    console.log('buckets:',buckets)

    return (
      <>
        <Textarea
          ref={ref}
          aria-label="Prompt"
          className="min-h-[40px] bg-white border-2 border-gray-200 rounded-lg relative"
          classNames={{
            ...classNames,
            label: cn("hidden", classNames?.label),
            input: cn("py-0", classNames?.input),
            innerWrapper: cn("bg-white", classNames?.innerWrapper),
            base: cn("border border-gray-100", classNames?.base),
          }}
          minRows={1}
          placeholder={dictionary.guide.askAnything[language]}
          radius="lg"
          variant="flat"
          {...props}
        />
        <div className="p-2 flex gap-2 items-center">
          <Popover placement="left">
            <PopoverTrigger>
              <Button
                size="sm"
                variant="bordered"
                startContent={<GoPlusCircle className="text-xs" />}
                className="bg-white border-2 border-gray-200 rounded-lg text-gray-500 text-xs flex-shrink-0"
              >
                {dictionary.guide.changeData[language]}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-5 h-96 overflow-y-auto ">
              <CheckboxGroup
                value={selectedBuckets}
                onChange={setSelectedBuckets}
                className="flex flex-col gap-2"
              >
                {buckets.map((bucket) => (
                  <Checkbox key={bucket.bucketId} value={bucket.bucketId}>
                    {bucket.documentName}
                  </Checkbox>
                ))}
              </CheckboxGroup>
            </PopoverContent>
          </Popover>
          <div className="flex gap-2 flex-wrap">
            {Array.from(new Set(buckets
              .filter((bucket) => selectedBuckets.includes(bucket.bucketId))
              .map((bucket) => bucket.bucketId)))
              .map((uniqueBucketId) => {
                const bucket = buckets.find(b => b.bucketId === uniqueBucketId);
                return (
                  <Chip
                    key={bucket.bucketId}
                    size="sm"
                    color="primary"
                    onClose={() =>
                      setSelectedBuckets(
                        selectedBuckets.filter((id) => id !== bucket.bucketId)
                      )
                    }
                    className="max-w-[100px]"
                  >
                    <span className="truncate max-w-12 block">
                      {bucket.documentName}
                    </span>
                  </Chip>
                );
              })}
          </div>
        </div>
      </>
    );
  }
);

const PromptInput = React.forwardRef((props, ref) => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <PromptInputContent {...props} ref={ref} />
    </Suspense>
  );
});

export default PromptInput;

PromptInput.displayName = "PromptInput";
PromptInputContent.displayName = "PromptInputContent";
