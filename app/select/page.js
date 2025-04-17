'use client'
import React from "react";
import { Icon } from "@iconify/react";
import FeatureCard from "./components/feature-card";
import { Card, CardHeader, CardTooltip, Button } from "@nextui-org/react";
import { useLanguageStore } from "@/app/components/languageStore";
import { dictionary } from "@/app/dictionary/dictionary";

function page() {
  const { language, setLanguage } = useLanguageStore();
  const featuresCategories = [
    {
      key: "ISSB",
      title: "ISSB",
      subtitle:"International Sustainability Standards Board",
      descriptions: ["BETA"],
      tooltipContent: dictionary?.select?.tooltipContent1[language],
    },
    {
      key: "KSSB",
      title: "KSSB",
      subtitle:"Korea Sustainability Standards Board",
      descriptions: ["BETA"],
      tooltipContent: dictionary?.select?.tooltipContent2[language],
    },
    {
      key: "CSRD",
      title: "CSRD",
      subtitle:"Corporate Sustainability Reporting Directive",
      descriptions: [dictionary?.select?.inProcess[language]],
      tooltipContent: "",
    },
    {
      key: "SEC",
      title: "SEC",
      subtitle:"Securities and Exchange Commission",
      descriptions: [dictionary?.select?.inProcess[language]],
      tooltipContent: "",
    },
    {
      key: "GRI",
      title: "GRI",
      subtitle:"Global Reporting Initiative",
      descriptions: [dictionary?.select?.inProcess[language]],
      tooltipContent: "",
    },
  ];

  return (
    <div className="w-full h-full p-12 flex flex-col justify-center items-center overflow-hidden">
      <div className="w-full h-1/10 flex justify-start items-center">
        <h1 className="text-start text-lg">{dictionary?.select?.subtitle[language]}</h1>
      </div>
      <div className="w-full h-full flex justify-center items-center">
        <div className="w-full h-1/2 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-5">
          {featuresCategories.map((category,cardNo) => (
            <FeatureCard
              key={category.key}
              descriptions={category.descriptions}
              icon={category.icon}
              title={category.title}
              subtitle={category.subtitle}
              tooltipContent={category.tooltipContent}
              cardNo={cardNo}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default page;
