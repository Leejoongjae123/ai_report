"use client";
import React, { useState } from "react";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Label } from "./ui/label";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Input,
  Checkbox,
} from "@nextui-org/react";
import { useLanguageStore } from "./languageStore";
import { dictionary } from "../dictionary/dictionary";

const TableCreationModal = ({
  isOpen,
  onClose,
  onOpenChange,
  createDefaultTable,
  createOptionalTable,
  years,
  setYears,
  subsidiaries,
  setSubsidiaries,
  categories,
  setCategories,
}) => {
  const { language } = useLanguageStore();
  const [step, setStep] = useState(1);
  const [scopes, setScopes] = useState([
    dictionary.tableCreationModal.step1select1[language],
    dictionary.tableCreationModal.step1select2[language],
  ]);
  // const [years, setYears] = useState(["2024"]);
  // const [subsidiaries, setSubsidiaries] = useState([
  //   "종속기업 없음(지배 기업만 공시)",
  // ]);
  // const [categories, setCategories] = useState([
  //   "Category 1 제품 서비스 구매",
  //   "Category 2 자본",
  //   "Category 3 구매연료/에너지",
  //   "Category 4 Upstream 운송&유통",
  //   "Category 5 사업장 발생 폐기물",
  // ]);
  const [hasScope3, setHasScope3] = useState(false);

  const handleNext = () => {
    if (step < (hasScope3 ? 4 : 3)) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };
  
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <h3>{dictionary.tableCreationModal.step1[language]}</h3>
            {[
              dictionary.tableCreationModal.step1select1[language],
              dictionary.tableCreationModal.step1select2[language],
              dictionary.tableCreationModal.step1select3[language],
            ].map((scope) => (
              <Checkbox
                classNames={{
                  wrapper:
                    "group-data-[selected=true]:border-[#F25B2B] group-data-[selected=true]:bg-[#F25B2B]",
                }}
                key={scope}
                isSelected={scopes.includes(scope)}
                onValueChange={(isSelected) => {
                  if (scope === dictionary.tableCreationModal.step1select3[language]) {
                    setScopes(
                      isSelected
                        ? [...scopes, scope]
                        : scopes.filter((s) => s !== scope)
                    );
                    setHasScope3(isSelected);
                  }
                }}
                isDisabled={scope !== dictionary.tableCreationModal.step1select3[language]}
              >
                {scope}
              </Checkbox>
            ))}
          </>
        );
      case 2:
        return (
          <>
            <h3>{dictionary.tableCreationModal.step2[language]}</h3>
            {["2022", "2023", "2024"].map((year) => (
              <Checkbox
                key={year}
                isSelected={years.includes(year)}
                onValueChange={(isSelected) => {
                  if (isSelected) {
                    setYears([...years, year]);
                  } else {
                    // 마지막 남은 항목을 선택 해제하려고 할 때 방지
                    if (years.length > 1) {
                      setYears(years.filter((y) => y !== year));
                    }
                  }
                }}
              >
                {year}
              </Checkbox>
            ))}
          </>
        );
      case 3:
        return (
          <>
            <h3>
              {dictionary.tableCreationModal.step3[language]}
            </h3>
            {[
              dictionary.tableCreationModal.step3select1[language],
              "Linkedin",
              "GitHub",
              "Skype",
            ].map((subsidiary) => (
              <Checkbox
                key={subsidiary}
                isSelected={subsidiaries.includes(subsidiary)}
                onValueChange={(isSelected) => {
                  if (subsidiary === dictionary.tableCreationModal.step3select1[language]) {
                    setSubsidiaries(isSelected ? [subsidiary] : []);
                  } else {
                    setSubsidiaries((prevSubsidiaries) => {
                      let newSubsidiaries = isSelected
                        ? [...prevSubsidiaries, subsidiary]
                        : prevSubsidiaries.filter((s) => s !== subsidiary);
                      newSubsidiaries = newSubsidiaries.filter(
                        (s) => s !== dictionary.tableCreationModal.step3select1[language]
                      );
                      // Ensure at least one subsidiary is selected
                      return newSubsidiaries.length === 0
                        ? [subsidiary]
                        : newSubsidiaries;
                    });
                  }
                }}
                // isDisabled={subsidiaries.length === 1 && subsidiaries.includes(subsidiary)}
              >
                {subsidiary}
              </Checkbox>
            ))}
          </>
        );
      case 4:
        return (
          <>
            <h3>{dictionary.tableCreationModal.step4[language]}</h3>
            {[
              dictionary.tableCreationModal.step4category1[language],
              dictionary.tableCreationModal.step4category2[language],
              dictionary.tableCreationModal.step4category3[language],
              dictionary.tableCreationModal.step4category4[language],
              dictionary.tableCreationModal.step4category5[language],
              dictionary.tableCreationModal.step4category6[language],
              dictionary.tableCreationModal.step4category7[language],
              dictionary.tableCreationModal.step4category8[language],
              dictionary.tableCreationModal.step4category9[language],
              dictionary.tableCreationModal.step4category10[language],
              dictionary.tableCreationModal.step4category11[language],
              dictionary.tableCreationModal.step4category12[language],
              dictionary.tableCreationModal.step4category13[language],
              dictionary.tableCreationModal.step4category14[language],
              dictionary.tableCreationModal.step4category15[language],
            ].map((category) => (
              <Checkbox
                key={category}
                isSelected={categories.includes(category)}
                onValueChange={(isSelected) => {
                  setCategories(
                    isSelected
                      ? [...categories, category]
                      : categories.filter((c) => c !== category)
                  );
                }}
              >
                {category}
              </Checkbox>
            ))}
          </>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              {dictionary.tableCreationModal.makeTable[language]}
            </ModalHeader>
            <ModalBody>{renderStepContent()}</ModalBody>
            <ModalFooter>
              {step > 1 && (
                <Button
                  variant="bordered"
                  onPress={handleBack}
                  className="border-[#F25B2B] text-[#F25B2B]"
                >
                  Back
                </Button>
              )}
              {step === 1 && (
                <Button
                  variant="bordered"
                  className="border-[#F25B2B] text-[#F25B2B]"
                  onPress={createDefaultTable}
                >
                  {dictionary.tableCreationModal.basicTable[language]}
                </Button>
              )}
              {step < 3 || (hasScope3 && step < 4) ? (
                <Button
                  color="primary"
                  onPress={handleNext}
                  className="bg-[#F25B2B] hover:bg-[#F25B2B]/90"
                >
                  Next
                </Button>
              ) : (
                <Button
                  color="primary"
                  onPress={() => {
                    if (step === 3) {
                      createDefaultTable();
                    } else if (step === 4) {
                      createDefaultTable();
                      createOptionalTable();
                    }
                    setStep(1);
                    onClose();
                  }}
                  className="bg-[#F25B2B] hover:bg-[#F25B2B]/90"
                >
                  Create
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TableCreationModal;
