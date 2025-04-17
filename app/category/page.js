"use client";

import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Link,
  Spacer,
  Tab,
  Tabs,
  Input,
} from "@nextui-org/react";
import { FrequencyEnum } from "./components/pricing-types";
import { frequencies, tiers } from "./components/pricing-tiers";
import { SearchIcon } from "./components/SearchIcon";
import { Listbox, ListboxItem } from "@nextui-org/react";
import { ListboxWrapper } from "./components/ListboxWrapper";
import { FaCheckCircle } from "react-icons/fa";
import { RiArrowUpDownLine } from "react-icons/ri";
import { FaRegEdit } from "react-icons/fa";
import { MdDeleteOutline } from "react-icons/md";
import { FaCircle } from "react-icons/fa";
import { useLanguageStore } from "@/app/components/languageStore";
import { dictionary } from "@/app/dictionary/dictionary";

export default function Component() {
  const [selectedFrequency, setSelectedFrequency] = useState(frequencies[0]);
  const [selectedTier1, setSelectedTier1] = useState("");
  const [selectedTier2, setSelectedTier2] = useState([]);
  const [selectedTier3, setSelectedTier3] = useState([]);
  const [selectedTier4, setSelectedTier4] = useState([]);
  const [tier1List, setTier1List] = useState(["IFRS S1", "IFRS S2"]);
  const [tier2List, setTier2List] = useState([]);
  const [tier3List, setTier3List] = useState([]);
  const [tier4List, setTier4List] = useState([]);
  const [searchTerm1, setSearchTerm1] = useState("");
  const [searchTerm2, setSearchTerm2] = useState("");
  const [searchTerm3, setSearchTerm3] = useState("");
  const [searchTerm4, setSearchTerm4] = useState("");
  const { language, setLanguage } = useLanguageStore();



  useEffect(() => {
    if (selectedTier2?.length > 0) {
      setTier2List(tiers[1].features?.[selectedTier1]);
    }
  }, [selectedTier2]);

  useEffect(() => {
    if (selectedTier3?.length > 0) {
      setTier3List(tiers[2].features?.[selectedTier2]);
    }
  }, [selectedTier3]);

  useEffect(() => {
    if (selectedTier4?.length > 0) {
      setTier4List(tiers[3].features?.[selectedTier3]);
    }
  }, [selectedTier4]);

  const onFrequencyChange = (selectedKey) => {
    const frequencyIndex = frequencies.findIndex((f) => f.key === selectedKey);
    setSelectedFrequency(frequencies[frequencyIndex]);
  };

  // Add filtered list functions for all tiers
  const filteredTier1List = tier1List.filter((item) =>
    item.toLowerCase().includes(searchTerm1.toLowerCase())
  );

  const filteredTier2List =
    tiers[1].features?.[selectedTier1]?.[language]?.filter((item) =>
      item.toLowerCase().includes(searchTerm2.toLowerCase())
    ) || [];

  const filteredTier3List =
    tiers[2].features?.[selectedTier2]?.filter((item) =>
      item.toLowerCase().includes(searchTerm3.toLowerCase())
    ) || [];

  const filteredTier4List =
    tiers[3].features?.[selectedTier3]?.filter((item) =>
      item.toLowerCase().includes(searchTerm4.toLowerCase())
    ) || [];

  console.log("searchTerm2:", searchTerm2);

  return (
    <div className="flex w-full h-full flex-col items-center">
      <div className="flex justify-end items-center gap-x-5 w-full h-24 px-12">
        <Button
          size="sm"
          radius="full"
          className="font-bold text-sm text-white"
          color="primary"
        >
          {dictionary?.category?.assign1[language]}
        </Button>
        <Button
          size="sm"
          radius="full"
          className=" font-bold text-sm bg-[#f25b2b] text-white"
          color="primary"
        >
          {dictionary?.category?.assign2[language]}
        </Button>
      </div>
      <div className="w-full h-full grid grid-cols-4 px-12 pb-12 gap-x-6">
        <Card key={tiers[0].key} className="relative p-3" shadow="md">
          <CardHeader className="flex flex-col items-center gap-2 ">
            <h2 className="text-lg font-bold text-center">{tiers[0].title[language]}</h2>
            {/* <p className="text-sm text-default-500">{tiers[0].description[language]}</p> */}
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <Input
              startContent={
                <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
              }
              value={searchTerm1}
              onChange={(e) => setSearchTerm1(e.target.value)}
              placeholder={dictionary?.category?.placeholder[language]}
            />
            <ListboxWrapper>
              <Listbox
                aria-label="Example with disabled actions"
                onSelectionChange={(keys) => {
                  setSelectedTier1(Array.from(keys)[0]);
                  setSelectedTier2([]);
                  setSelectedTier3([]);
                  setSelectedTier4([]);
                }} // Set에서 첫 번째 값만 추출
                selectedKeys={[selectedTier1]} // 문자열을 배열로 감싸서 전달
                selectionMode="single"
              >
                <ListboxItem
                  startContent={<FaCircle className="text-gray-500" />}
                  key="main"
                  className="group bg-gray-300 text-gray-700 hover:text-gray-500 hover:bg-gray-300"
                  // endContent={<div className="flex gap-2 text-xs">순서</div>}
                  isDisabled
                >
                  {dictionary?.category?.name[language]}
                </ListboxItem>
                {filteredTier1List.map((feature, index) => (
                  <ListboxItem
                    startContent={
                      index === 0 ? (
                        <FaCircle className="text-gray-700" />
                      ) : (
                        <FaCheckCircle className="text-gray-700" />
                      )
                    }
                    key={feature}
                    className="group"
                    isDisabled={index === 0}
                    endContent={
                      <div className="flex gap-2">
                        <FaRegEdit className="text-red-500 hidden group-hover:block transition-opacity duration-1000 opacity-0 group-hover:opacity-100" />
                        <MdDeleteOutline className="text-red-500 hidden group-hover:block transition-opacity duration-1000 opacity-0 group-hover:opacity-100" />
                        <RiArrowUpDownLine className="text-gray-700" />
                      </div>
                    }
                  >
                    {feature}
                  </ListboxItem>
                ))}
              </Listbox>
            </ListboxWrapper>
          </CardBody>
        </Card>
        <Card key={tiers[1].key} className="relative p-3" shadow="md">
          <CardHeader className="flex flex-col items-center gap-2 ">
            <h2 className="text-lg font-bold text-center">{tiers[1].title[language]}</h2>
            {/* <p className="text-sm text-default-500">{tiers[1].description[language]}</p> */}
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <Input
              startContent={
                <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
              }
              value={searchTerm2}
              onChange={(e) => setSearchTerm2(e.target.value)}
              placeholder={dictionary?.category?.placeholder[language]}
            ></Input>
            <ListboxWrapper>
              <Listbox
                aria-label="Example with disabled actions"
                onSelectionChange={(keys) => {
                  setSelectedTier2(Array.from(keys)[0]);
                  setSelectedTier3([]);
                  setSelectedTier4([]);
                }} // Set에서 첫 번째 값만 추출
                selectedKeys={[selectedTier2]} // 문자열을 배열로 감싸서 전달
                selectionMode="single"
              >
                <ListboxItem
                  startContent={<FaCircle className="text-gray-500" />}
                  key="main1"
                  className="group bg-gray-300 text-gray-700 hover:text-gray-500 hover:bg-gray-300"
                  // endContent={<div className="flex gap-2 text-xs">순서</div>}
                  isDisabled
                >
                  {dictionary?.category?.name[language]}
                </ListboxItem>
                {filteredTier2List.map((feature, index) => (
                  <ListboxItem
                    startContent={<FaCheckCircle className="text-gray-700" />}
                    key={feature}
                    className="group"
                    endContent={
                      <div className="flex gap-2">
                        <FaRegEdit className="text-red-500 hidden group-hover:block transition-opacity duration-1000 opacity-0 group-hover:opacity-100" />
                        <MdDeleteOutline className="text-red-500 hidden group-hover:block transition-opacity duration-1000 opacity-0 group-hover:opacity-100" />
                        <RiArrowUpDownLine className="text-gray-700" />
                      </div>
                    }
                  >
                    {feature}
                  </ListboxItem>
                ))}
              </Listbox>
            </ListboxWrapper>
          </CardBody>
        </Card>
        <Card key={tiers[2].key} className="relative p-3" shadow="md">
          <CardHeader className="flex flex-col items-center gap-2 ">
            <h2 className="text-lg font-bold text-center">{tiers[2].title[language]}</h2>
            {/* <p className="text-sm text-default-500">{tiers[2].description[language]}</p> */}
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <Input
              startContent={
                <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
              }
              value={searchTerm3}
              onChange={(e) => setSearchTerm3(e.target.value)}
              placeholder={dictionary?.category?.placeholder[language]}
            ></Input>
            <ListboxWrapper>
              <Listbox
                aria-label="Example with disabled actions"
                onSelectionChange={(keys) => {
                  setSelectedTier3(Array.from(keys)[0]);
                  setSelectedTier4([]);
                }} // Set에서 첫 번째 값만 추출
                selectedKeys={[selectedTier3]} // 문자열을 배열로 감싸서 전달
                selectionMode="single"
              >
                <ListboxItem
                  startContent={<FaCircle className="text-gray-500" />}
                  key="main1"
                  className="group bg-gray-300 text-gray-700 hover:text-gray-500 hover:bg-gray-300"
                  // endContent={<div className="flex gap-2 text-xs">순서</div>}
                  isDisabled
                >
                  
                  {dictionary?.category?.name[language]}
                </ListboxItem>
                {filteredTier3List.map((feature, index) => (
                  <ListboxItem
                    startContent={<FaCheckCircle className="text-gray-700" />}
                    key={feature}
                    className="group"
                    endContent={
                      <div className="flex gap-2">
                        <FaRegEdit className="text-red-500 hidden group-hover:block transition-opacity duration-1000 opacity-0 group-hover:opacity-100" />
                        <MdDeleteOutline className="text-red-500 hidden group-hover:block transition-opacity duration-1000 opacity-0 group-hover:opacity-100" />
                        <RiArrowUpDownLine className="text-gray-700" />
                      </div>
                    }
                  >
                    {feature}
                  </ListboxItem>
                ))}
              </Listbox>
            </ListboxWrapper>
          </CardBody>
        </Card>
        <Card key={tiers[3].key} className="relative p-3" shadow="md">
          <CardHeader className="flex flex-col items-center gap-2 ">
            <h2 className="text-lg font-bold text-center">{tiers[3].title[language]}</h2>
            {/* <p className="text-sm text-default-500">{tiers[3].description[language]}</p> */}
          </CardHeader>
          <Divider />
          <CardBody className="gap-4">
            <Input
              startContent={
                <SearchIcon className="text-black/50 mb-0.5 dark:text-white/90 text-slate-400 pointer-events-none flex-shrink-0" />
              }
              value={searchTerm4}
              onChange={(e) => setSearchTerm4(e.target.value)}
              placeholder={dictionary?.category?.placeholder[language]}
            ></Input>
            <ListboxWrapper>
              <Listbox
                aria-label="Example with disabled actions"
                onSelectionChange={(keys) => {
                  setSelectedTier4(Array.from(keys)[0]);
                }} // Set에서 첫 번째 값만 추출
                selectedKeys={[selectedTier4]} // 문자열을 배열로 감싸서 전달
                selectionMode="single"
              >
                <ListboxItem
                  startContent={<FaCircle className="text-gray-500" />}
                  key="main1"
                  className="group bg-gray-300 text-gray-700 hover:text-gray-500 hover:bg-gray-300"
                  // endContent={<div className="flex gap-2 text-xs">순서</div>}
                  isDisabled
                >
                  {dictionary?.category?.name[language]}
                </ListboxItem>
                {filteredTier4List.map((feature, index) => (
                  <ListboxItem
                    startContent={<FaCheckCircle className="text-gray-700" />}
                    key={feature}
                    className="group"
                    endContent={
                      <div className="flex gap-2">
                        <FaRegEdit className="text-red-500 hidden group-hover:block transition-opacity duration-1000 opacity-0 group-hover:opacity-100" />
                        <MdDeleteOutline className="text-red-500 hidden group-hover:block transition-opacity duration-1000 opacity-0 group-hover:opacity-100" />
                        <RiArrowUpDownLine className="text-gray-700" />
                      </div>
                    }
                  >
                    {feature}
                  </ListboxItem>
                ))}
              </Listbox>
            </ListboxWrapper>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
