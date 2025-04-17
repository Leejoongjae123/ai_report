"use client";
import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import HardBreak from "@tiptap/extension-hard-break";
import "./EditorStyles.css";
import TextAlign from '@tiptap/extension-text-align'
// shadcn UI 컴포넌트 import
import { Toggle } from "../components/ui/toggle";
import { Separator } from "../components/ui/separator";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Table as TableIcon,
  Grid,
} from "lucide-react";
import Table from "@tiptap/extension-table";
import TableRow from "@tiptap/extension-table-row";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableCreationModal from "./TableCreationModal";
import { useDisclosure } from "@nextui-org/react";
import styled from "styled-components";
import { dictionary } from "@/app/dictionary/dictionary";
import { useLanguageStore } from "@/app/components/languageStore";

// 선택 상태를 추적하는 새로운 플러그인
const SelectionPlugin = new Plugin({
  key: new PluginKey("selection"),
  state: {
    init() {
      return { from: 0, to: 0 };
    },
    apply(tr, prev) {
      const { selection } = tr;
      return { from: selection.from, to: selection.to };
    },
  },
});

// CustomFocus Extension 수정
const CustomFocus = Extension.create({
  name: "customFocus",

  addOptions() {
    return {
      language: 'korean' // 기본값 설정
    }
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("custom-focus"),
        props: {
          decorations: (state) => {
            const { doc, selection } = state;
            const decorations = [];
            const language = this.options.language; // options에서 language 가져오기

            const targetPhrases = [
              dictionary.guide.smallTitle1[language],
              dictionary.guide.smallTitle2[language],
              dictionary.guide.smallTitle3[language]
            ];

            doc.descendants((node, pos) => {
              if (node.type.name === "paragraph") {
                const from = pos;
                const to = pos + node.nodeSize;
                const nodeText = node.textContent;

                // 대상 문구 중 하나라도 포함되어 있는지 확인
                const hasTargetPhrase = targetPhrases.some(phrase => 
                  nodeText.includes(phrase)
                );

                if (hasTargetPhrase) {
                  const isSelected = selection.from < to && selection.to > from;
                  if (isSelected) {
                    decorations.push(
                      Decoration.node(from, to, {
                        class: "has-focus orange",
                      })
                    );
                  }
                }
              }
            });

            return DecorationSet.create(doc, decorations);
          },
        },
      }),
    ];
  },
});

function decorateGroup(group, startPos, endPos, decorations, selectionState) {
  const targetPhrases = [
    "이사회의 역할 및 책임",
    "관리 감독 체계",
    "경영진의 역할 및 감독 프로세스"
  ];

  const hasTargetPhrase = targetPhrases.some(phrase => 
    group.includes(phrase)
  );

  if (hasTargetPhrase) {
    const isSelected =
      selectionState.from < endPos && selectionState.to > startPos;

    if (isSelected) {
      decorations.push(
        Decoration.node(startPos, endPos, {
          class: "has-focus orange",
        })
      );
    }
  }
}

// Styled component for the editor content
const StyledEditorContent = styled(EditorContent)`
  .ProseMirror {
    > * + * {
      margin-top: 0.75em;
    }

    table {
      border-collapse: collapse;
      margin: 0;
      overflow: hidden;
      table-layout: fixed;
      width: 100%;

      td,
      th {
        border: 2px solid #ced4da;
        box-sizing: border-box;
        min-width: 1em;
        padding: 3px 5px;
        position: relative;
        vertical-align: top;
        font-size: 0.7em; // Adjusted font size


        > * {
          margin-bottom: 0;
        }
      }

      th {
        background-color: #f1f3f5;
        font-weight: bold;
        text-align: left;
      }
      .footnote {
        font-size: 0.75em;
        color: #666;
    }
    }

  }
`;

// Styled component for the table
const StyledTable = styled.table`
  border-collapse: collapse;
  width: 100%;

  td,
  th {
    border: 1px solid black;
    padding: 5px;
  }

  th {
    font-weight: bold;
  }
`;

const SmallText = Extension.create({
  name: 'smallText',

  addAttributes() {
    return {
      fontSize: {
        default: '0.75em',
        renderHTML: attributes => ({
          style: `font-size: ${attributes.fontSize}`
        })
      }
    }
  }
})

const CustomEditor = ({
  category,
  setCategory,
  selectedItem,
  selectedText,
  setSelectedText,
  currentText,
  setCurrentText,
  answer,
  chatReference,
  setChatReference
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputContents, setInputContents] = useState("");
  const [years, setYears] = useState(["2024"]);
  const [subsidiaries, setSubsidiaries] = useState([
    "종속기업 없음(지배 기업만 공시)",
  ]);
  const { language } = useLanguageStore();
  const [categories, setCategories] = useState([
    dictionary.tableCreationModal.step4category1[language],
    dictionary.tableCreationModal.step4category2[language],
    dictionary.tableCreationModal.step4category3[language],
    dictionary.tableCreationModal.step4category4[language],
    dictionary.tableCreationModal.step4category5[language],
  ]);
  // console.log('selectedText:',selectedText)

  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          keepMarks: true,
        },
      }),
      CustomFocus.configure({
        language: language // language 값을 Extension에 전달
      }),
      TextAlign.configure({
        types: ['paragraph'],
        alignments: ['left', 'right'],
        defaultAlignment: 'left',
      }),
      HardBreak.extend({
        addKeyboardShortcuts() {
          return {
            Enter: () => this.editor.commands.setHardBreak(),
          };
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      SmallText,
    ],
    content: "", // 초기 내용을 비워둡니다.
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  });

  
  const handleCategoryChange = () => {
    setCategory("");
    const categories = {
      [dictionary.guide.smallTitle1[language]]: "가",
      [dictionary.guide.smallTitle2[language]]: "나",
      [dictionary.guide.smallTitle3[language]]: "다",
      "(라)": "라",
      "(마)": "마",
      "(바)": "바",
      "(사)": "사",
      "(아)": "아",
      "(자)": "자",
      "(차)": "차",
      "(카)": "카",
      "(타)": "타",
      "(파)": "파",
      "(하)": "하",
    };

    for (const [key, value] of Object.entries(categories)) {
      if (selectedText.includes(key)) {
        setCategory(value);
        break;
      }
    }
  };
  useEffect(() => {
    handleCategoryChange(category);
  }, [selectedText]);
  
  // answer의 변경을 감지하여 inputContents를 업데이트하는 useEffect 수정
  useEffect(() => {
    if (selectedItem === "weather" && answer) {
      const content = `
        <h1 style="font-weight: 700;">${dictionary.guide.governanceSample[language]}</h1>
        <h2>${dictionary.guide.governance1[language]}</h2>
        <p><b>${dictionary.guide.smallTitle1[language]}</b><br/>${answer[0]?.answer || ''}</p>
        <br/>
        <p><b>${dictionary.guide.smallTitle2[language]}</b><br/>${answer[1]?.answer || ''}</p>
      `;
      setInputContents(content);
      
      // answer가 업데이트되면 currentText도 업데이트
      const sections = [];
      if (answer[0]) {
        sections.push(`${dictionary.guide.smallTitle1[language]}${answer[0]}`);
      }
      if (answer[1]) {
        sections.push(`${dictionary.guide.smallTitle2[language]}${answer[1]}`);
      }
      if (sections.length > 0) {
        setCurrentText(sections);
      }
    }
  }, [answer, selectedItem]);

  // selectedItem 변경 시 기본 템플릿 설정
  useEffect(() => {
    if (selectedItem === "manager") {
      setInputContents(`
        <h1 style="font-weight: 700;">${dictionary.guide.governanceSample[language]}</h1>
        <h2>${dictionary.guide.governance2[language]}</h2>
        <p><b>${dictionary.guide.smallTitle3[language]}</b><br/>${answer[2]?.answer || ''}</p>
      `);
    } else if (selectedItem === "indicator") {
      setInputContents(`
        <h1 style="font-weight: 700;">${dictionary.guide.metric[language]}</h1>
        <h2>${dictionary.guide.metric1[language]}</h2>
        <p>${dictionary.guide.smallTitle4[language]}</p>
      `);
    }
  }, [selectedItem]);

  // 에디터 내용 업데이트
  useEffect(() => {
    if (editor && inputContents) {
      editor.commands.setContent(inputContents);
    }
  }, [editor, inputContents]);

  // 선택된 텍스트를 가져오는 함수
  const getSelectedText = () => {
    if (editor) {
      const { from, to } = editor.state.selection;
      if (from !== to) {
        return editor.state.doc.textBetween(from, to, " ");
      }
    }
    return "";
  };


  useEffect(() => {
    if (editor) {
      const updateSelectedText = () => {
        const hasFocusElement = document.querySelector(".has-focus");
        if (hasFocusElement) {
          setSelectedText(hasFocusElement.textContent || "");
        } else {
          setSelectedText("");
        }
      };

      editor.on("selectionUpdate", updateSelectedText);
      editor.on("update", updateSelectedText);

      return () => {
        editor.off("selectionUpdate", updateSelectedText);
        editor.off("update", updateSelectedText);
      };
    }
  }, [editor]);

  // selectedItem이 변경될 때마다 에디터 내용을 업데이트하는 useEffect
  useEffect(() => {
    if (editor) {
      const content = inputContents;
      editor.commands.setContent(content);
    }
  }, [editor, selectedItem, inputContents]);

  // 툴바 아이템 컴포넌트 수정
  const ToolbarItem = ({ icon, label, action, isActive }) => (
    <Toggle
      size="sm"
      pressed={isActive}
      onPressedChange={action}
      aria-label={label}
    >
      {icon}
    </Toggle>
  );

  const tableItem = editor && (
    <Toggle
      size="sm"
      pressed={editor.isActive("table")}
      onPressedChange={onOpen}
      aria-label="테이블 삽입"
    >
      <TableIcon className="h-4 w-4" />
    </Toggle>
  );
  console.log(subsidiaries);

  const handleCreateDefaultTable = () => {
    if (!editor) return;

    // years 배열을 오름차순으로 정렬
    const sortedYears = [...years].sort((a, b) => a - b);

    // subsidiaries에서 특정 회사들을 확인
    const specialSubsidiaries = [dictionary.table.tableMicrosoft[language]];
    ["Linkedin", "Github", "Skype"].forEach((sub) => {
      if (
        subsidiaries.some((s) => s.toLowerCase().includes(sub.toLowerCase()))
      ) {
        specialSubsidiaries.push(sub);
      }
    });

    const generateYearHeaders = () => {
      const headers = sortedYears.map((year) => ({
        type: "tableHeader",
        attrs: {
          colspan:
            year === sortedYears[sortedYears.length - 1]
              ? specialSubsidiaries.length + 1
              : 1,
          rowspan: 1,
        },
        content: [
          { type: "paragraph", content: [{ type: "text", text: year }] },
        ],
      }));
      return headers;
    };

    const generateSubHeaders = () => {
      return sortedYears.flatMap((year) => {
        if (year === sortedYears[sortedYears.length - 1]) {
          return [
            {
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                    content: [{ type: "text", text: dictionary.table.tableHeader4[language] }],
                  },
              ],
            },
            ...specialSubsidiaries.map((sub) => ({
              type: "tableHeader",
              content: [
                { type: "paragraph", content: [{ type: "text", text: sub }] },
              ],
            })),
          ];
        } else {
          return [
            {
              type: "tableHeader",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: dictionary.table.tableHeader4[language] }],
                },
              ],
            },
          ];
        }
      });
    };

    const generateDataCells = (baseValue) => {
      return sortedYears.flatMap((year, index) => {
        const value = (baseValue * (1 + index * 0.1)).toFixed(2);
        if (year === sortedYears[sortedYears.length - 1]) {
          const totalValue = parseFloat(value);
          const microsoftValue = (totalValue * 0.5).toFixed(2); // 마이크로소프트는 50%

          // 나머지 회사들의 비율 생성
          let remainingPercentage = 50;
          const otherCompaniesPercentages = [];
          for (let i = 0; i < specialSubsidiaries.length - 2; i++) {
            const randomPercentage = Math.random() * remainingPercentage;
            otherCompaniesPercentages.push(randomPercentage);
            remainingPercentage -= randomPercentage;
          }
          otherCompaniesPercentages.push(remainingPercentage);

          // 비율을 섞어서 랜덤성 추가
          otherCompaniesPercentages.sort(() => Math.random() - 0.5);

          return [
            {
              type: "tableCell",
              content: [
                { type: "paragraph", content: [{ type: "text", text: value }] },
              ],
            },
            {
              type: "tableCell",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: microsoftValue }],
                },
              ],
            },
            ...otherCompaniesPercentages.map((percentage) => ({
              type: "tableCell",
              content: [
                {
                  type: "paragraph",
                  content: [
                    {
                      type: "text",
                      text: ((totalValue * percentage) / 100).toFixed(2),
                    },
                  ],
                },
              ],
            })),
          ];
        } else {
          return [
            {
              type: "tableCell",
              content: [
                { type: "paragraph", content: [{ type: "text", text: value }] },
              ],
            },
          ];
        }
      });
    };

    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: "paragraph",
          content: [{ type: "text", text: "◼ Scope 1, 2" }],
        },
        {
          type: "table",
          content: [
            {
              type: "tableRow",
              content: [
                {
                  type: "tableHeader",
                  attrs: { colspan: 1, rowspan: 2 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: dictionary.table.tableHeader1[language] }],
                    },
                  ],
                },
                {
                  type: "tableHeader",
                  attrs: { colspan: 1, rowspan: 2 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: dictionary.table.tableHeader2[language] }],
                    },
                  ],
                },
                {
                  type: "tableHeader",
                  attrs: { colspan: 1, rowspan: 2 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: dictionary.table.tableHeader3[language] }],
                    },
                  ],
                },
                ...generateYearHeaders(),
              ],
            },
            {
              type: "tableRow",
              content: generateSubHeaders(),
            },
            // Data rows for Scope 1
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  attrs: { colspan: 1, rowspan: 3 },
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        { type: "text", text: dictionary.table.tableCell1[language] },
                      ],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: dictionary.table.tableCell3[language] }],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "tCO2eq" }],
                    },
                  ],
                },
                ...generateDataCells(128),
              ],
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: dictionary.table.tableCell4[language] }],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: dictionary.table.tableCell5[language] }],
                    },
                  ],
                },
                ...generateDataCells(3.37),
              ],
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: dictionary.table.tableCell4[language] }],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: dictionary.table.tableCell6[language] }],
                    },
                  ],
                },
                ...generateDataCells(0.62),
              ],
            },
            // Data rows for Scope 2
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  attrs: { colspan: 1, rowspan: 3 },
                  content: [
                    {
                      type: "paragraph",
                      content: [
                        { type: "text", text: dictionary.table.tableCell2[language] },
                      ],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: dictionary.table.tableCell3[language] }],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "tCO2eq" }],
                    },
                  ],
                },
                ...generateDataCells(2580),
              ],
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: dictionary.table.tableCell4[language] }],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: dictionary.table.tableCell5[language] }],
                    },
                  ],
                },
                ...generateDataCells(67.89),
              ],
            },
            {
              type: "tableRow",
              content: [
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: dictionary.table.tableCell4[language] }],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: dictionary.table.tableCell6[language] }],
                    },
                  ],
                },
                ...generateDataCells(12.59),
              ],
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: dictionary.table.tableExplanation1[language],
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: dictionary.table.tableExplanation2[language],
            },
          ],
        },
        {
          type: "paragraph",
          attrs: { style: 'font-size: 0.75em;' }, // 작은 글씨 크기 적용
          content: [{ type: "text", text: dictionary.table.tableExplanation3[language]+"\n" }],
        },
        {
          type: "paragraph",
          attrs: { style: 'font-size: 0.75em;' }, // 작은 글씨 크기 적용
          content: [{ type: "text", text: dictionary.table.tableExplanation4[language]+"\n" }],
        },
      ])
      .run();
  };

  const handleCreateOptionalTable = () => {
    if (!editor) return;

    // years 배열을 오름차순으로 정렬
    const sortedYears = [...years].sort((a, b) => a - b);

    const generateHeaders = () => {
      return [
        {
          type: "tableHeader",
          content: [
            { type: "paragraph", content: [{ type: "text", text: dictionary.table.tableHeader1[language] }] },
          ],
        },
        ...sortedYears.map((year) => ({
          type: "tableHeader",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: year.toString() }],
            },
          ],
        })),
      ];
    };

    // 기본 값 매핑을 실제 데이터로 수정
    const baseValues = {
      "Scope3": 14226771, // 첫 번째 연도 기준값
      [dictionary.tableCreationModal.step4category1[language]]: 4930000,
      [dictionary.tableCreationModal.step4category2[language]]: 4179000,
      [dictionary.tableCreationModal.step4category3[language]]: 350000,
      [dictionary.tableCreationModal.step4category4[language]]: 225000,
      [dictionary.tableCreationModal.step4category5[language]]: 5700,
    };

    // generateRow 함수 수정
    const generateRow = (category, baseValue) => {
      // 카테고리별 연도 데이터 매핑
      const yearlyData = {
        "Scope3": [14226771, 16491240, 17020560],
        [dictionary.tableCreationModal.step4category1[language]]: [4930000, 5780000, 5564000],
        [dictionary.tableCreationModal.step4category2[language]]: [4179000, 4026000, 5872000],
        [dictionary.tableCreationModal.step4category3[language]]: [350000, 450000, 521000],
        [dictionary.tableCreationModal.step4category4[language]]: [225000, 371000, 318000],
        [dictionary.tableCreationModal.step4category5[language]]: [5700, 8000, 8000],
        [dictionary.tableCreationModal.step4category6[language]]: [21901, 139000, 133000],
        [dictionary.tableCreationModal.step4category7[language]]: [80000, 141000, 187000],
        [dictionary.tableCreationModal.step4category8[language]]: [69000, 69000, 69000],
        [dictionary.tableCreationModal.step4category9[language]]: [3950000, 5101000, 3941000],
        [dictionary.tableCreationModal.step4category10[language]]: [19000, 18000, 4000],
        [dictionary.tableCreationModal.step4category11[language]]: [9600, 8000, 7000],
        [dictionary.tableCreationModal.step4category12[language]]: [317000, 313000, 327000],
        [dictionary.tableCreationModal.step4category13[language]]: [65000, 62000, 64000],
        [dictionary.tableCreationModal.step4category14[language]]: [3400, 3010, 2980],
        [dictionary.tableCreationModal.step4category15[language]]: [2170, 2230, 2580],
      };

      // baseValues도 업데이트
      const baseValues = {
        "Scope3": 14226771,
        [dictionary.tableCreationModal.step4category1[language]]: 4930000,
        [dictionary.tableCreationModal.step4category2[language]]: 4179000,
        [dictionary.tableCreationModal.step4category3[language]]: 350000,
        [dictionary.tableCreationModal.step4category4[language]]: 225000,
        [dictionary.tableCreationModal.step4category5[language]]: 5700,
        [dictionary.tableCreationModal.step4category6[language]]: 21901,
        [dictionary.tableCreationModal.step4category7[language]]: 80000,
        [dictionary.tableCreationModal.step4category8[language]]: 69000,
        [dictionary.tableCreationModal.step4category9[language]]: 3950000,
        [dictionary.tableCreationModal.step4category10[language]]: 19000,
        [dictionary.tableCreationModal.step4category11[language]]: 9600,
        [dictionary.tableCreationModal.step4category12[language]]: 317000,
        [dictionary.tableCreationModal.step4category13[language]]: 65000,
        [dictionary.tableCreationModal.step4category14[language]]: 3400,
        [dictionary.tableCreationModal.step4category15[language]]: 2170,
      };

      return {
        type: "tableRow",
        content: [
          {
            type: "tableCell",
            content: [
              {
                type: "paragraph",
                content: [{ 
                  type: "text", 
                  text: category.replace(/(\d+)/, '$1\n') // 숫자 다음에 개행 추가
                }],
              },
            ],
          },
          ...sortedYears.map((year, index) => {
            // 실제 데이터가 있으면 사용하고, 없으면 이전 계산 방식 사용
            const value = yearlyData[category] ? 
              yearlyData[category][index] || Math.round(baseValue * (1 + index * 0.1)) :
              Math.round(baseValue * (1 + index * 0.1));

            return {
              type: "tableCell",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: value.toLocaleString() }],
                },
              ],
            };
          }),
        ],
      };
    };

    // categories를 정렬하는 함수
    const sortCategories = (cats) => {
      return cats.sort((a, b) => {
        const aNum = parseInt(a.match(/\d+/)?.[0] || "0");
        const bNum = parseInt(b.match(/\d+/)?.[0] || "0");
        return aNum - bNum;
      });
    };

    const sortedCategories = sortCategories(categories);

    const tableContent = [
      { type: "tableRow", content: generateHeaders() },
      generateRow("Scope3", baseValues["Scope3"] || 3000),
      ...sortedCategories.map(category => 
        generateRow(category, baseValues[category] || 100) // 기본값이 없으면 100으로 설정
      )
    ];

    editor
      .chain()
      .focus()
      .insertContent([
        {
          type: "paragraph",
          content: [{ type: "text", text: "◼ Scope 3" }],
        },
        {
          type: "paragraph",
          attrs: { textAlign: 'right' },  // 우측 정렬 속성 추가
          content: [{ type: "text", text: dictionary.table.tableHeaderUpper[language] }],
        },
        {
          type: "table",
          content: tableContent,
        },
        {
          type: "paragraph",
          attrs: { class: 'footnote' },  // footnote 클래스 추가
          content: [
            {
              type: "text",
              text: dictionary.table.tableExplanation4[language],
            },
          ],
        },
      ])
      .run();
  };

  // 에디터 내용이 변경될 때마다 텍스트를 분석하고 업데이트하는 함수
  const updateCurrentText = () => {
    if (editor) {
      const content = editor.getHTML();
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const text = tempDiv.textContent || '';

      // 구분자 정의
      const delimiters = [
        dictionary.guide.smallTitle1[language],
        dictionary.guide.smallTitle2[language],
        dictionary.guide.smallTitle3[language]
      ];

      let sections = [];
      let lastIndex = 0;

      delimiters.forEach((delimiter, index) => {
        const startIndex = text.indexOf(delimiter);
        if (startIndex !== -1) {
          // 다음 구분자의 위치 찾기
          const nextDelimiter = delimiters[index + 1];
          let endIndex;
          
          if (nextDelimiter) {
            endIndex = text.indexOf(nextDelimiter);
            endIndex = endIndex === -1 ? text.length : endIndex;
          } else {
            endIndex = text.length;
          }

          // 구분자 이후의 텍스트 추출 (구분자 포함)
          const sectionText = text.substring(startIndex, endIndex).trim();
          
          // 빈 섹션이 아닌 경우에만 추가
          if (sectionText) {
            sections.push(sectionText);
          }
        }
      });

      if (sections.length > 0) {
        setCurrentText(sections);
      }
    }
  };

  // 에디터 내용이 변경될 때마다 실행
  useEffect(() => {
    if (editor) {
      // 초기 내용 로드 시 실행
      updateCurrentText();

      // 변경 이벤트 리스너 등록
      editor.on('update', updateCurrentText);
      
      return () => {
        editor.off('update', updateCurrentText);
      };
    }
  }, [editor]);
  
  // Add state to track previous selectedText
  const [prevSelectedText, setPrevSelectedText] = useState("");

  // Update useEffect to check for changes
  useEffect(() => {
    if (selectedText !== prevSelectedText) {
      setChatReference([]);
      setPrevSelectedText(selectedText);
    }
  }, [selectedText]);
  



  return (
    <div>
      {editor && (
        <div className="toolbar flex flex-row items-center gap-1 p-1 border border-input bg-transparent rounded-md m-5">
          <ToolbarItem
            icon={<Bold className="h-4 w-4" />}
            label="굵게"
            action={() => editor.chain().focus().toggleBold().run()}
            isActive={editor.isActive("bold")}
          />
          <ToolbarItem
            icon={<Italic className="h-4 w-4" />}
            label="기울임"
            action={() => editor.chain().focus().toggleItalic().run()}
            isActive={editor.isActive("italic")}
          />
          <ToolbarItem
            icon={<Underline className="h-4 w-4" />}
            label="밑줄"
            action={() => editor.chain().focus().toggleUnderline().run()}
            isActive={editor.isActive("underline")}
          />
          <Separator orientation="vertical" className="w-[1px] h-8" />
          <ToolbarItem
            icon={<Strikethrough className="h-4 w-4" />}
            label="취소선"
            action={() => editor.chain().focus().toggleStrike().run()}
            isActive={editor.isActive("strike")}
          />
          <Separator orientation="vertical" className="w-[1px] h-8" />
          {tableItem}
          {/* <Toggle
            size="sm"
            onPressedChange={handleCreateDefaultTable}
            aria-label="기본 테이블 삽입"
          >
            <Grid className="h-4 w-4" />
          </Toggle>
          <Toggle
            size="sm"
            onPressedChange={handleCreateOptionalTable}
            aria-label="Optional Table"
          >
            <Grid className="h-4 w-4" />
          </Toggle> */}
        </div>
      )}
      <div className={`editor-container p-5`}>
        <StyledEditorContent editor={editor} />
      </div>

      {/* <div className="selected-text-container">
        <h3>선택된 텍스트:</h3>
        <p className="selected-text">{selectedText}</p>
      </div> */}
      <TableCreationModal
        isOpen={isOpen}
        onOpen={onOpen}
        onOpenChange={onOpenChange}
        createDefaultTable={handleCreateDefaultTable}
        createOptionalTable={handleCreateOptionalTable}
        years={years}
        setYears={setYears}
        subsidiaries={subsidiaries}
        setSubsidiaries={setSubsidiaries}
        categories={categories}
        setCategories={setCategories}
      />
    </div>
  );
};

export default CustomEditor;
