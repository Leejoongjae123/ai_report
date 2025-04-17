"use client";

import React from "react";
import {
  Button,
  Divider,
  Link,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Textarea,
  useDisclosure,
} from "@nextui-org/react";
import { Icon } from "@iconify/react";
import { Listbox, ListboxItem } from "@nextui-org/react";
import { ListboxWrapper } from "./components/ListboxWrapper";
import FeedbackRating from "./components/feedback-rating";
import { MdOutlineCancel } from "react-icons/md";

export default function Component() {
  // Remove defaultOpen when using this component
  const { isOpen, onOpen, onOpenChange } = useDisclosure({ defaultOpen: true });
  const items = [
    {
      key: "버킷1",
      label: "버킷1",
    },
    {
      key: "버킷2",
      label: "버킷2",
    },
    {
      key: "버킷3",
      label: "버킷3",
    },
    {
      key: "버킷4",
      label: "버킷4",
    },
  ];
  return (
    <div className="w-full h-full grid grid-cols-6">
      <div className="col-span-1 border-r">
        <div className="p-3">
          <h1 className="font-bold text-lg">버킷명</h1>
        </div>

        <ListboxWrapper>
          <Listbox className="gap-5" items={items} aria-label="Dynamic Actions">
            {(item) => (
              <ListboxItem
                key={item.key}
                color={item.key === "delete" ? "danger" : "default"}
                className={item.key === "delete" ? "text-danger" : ""}
              >
                {item.label}
              </ListboxItem>
            )}
          </Listbox>
        </ListboxWrapper>
      </div>
      <div className="col-span-1 border-r ">
        <div className="p-3">
          <h1 className="font-bold text-lg">파일리스트</h1>
        </div>

        <div className="flex flex-col gap-1 px-3">
          <Button endContent={<MdOutlineCancel className="text-red-500" />} size='sm'>파일1</Button>
          <Button endContent={<MdOutlineCancel className="text-red-500" />} size='sm'>파일1</Button>
          <Button endContent={<MdOutlineCancel className="text-red-500" />} size='sm'>파일1</Button>
          <Button endContent={<MdOutlineCancel className="text-red-500" />} size='sm'>파일1</Button>
        </div>
      </div>
      <div className="col-span-4 border-r px-5">
      <div className="p-3">
          <h1 className="font-bold text-lg">파일추가</h1>
        </div>
      </div>
    </div>
  );
}
