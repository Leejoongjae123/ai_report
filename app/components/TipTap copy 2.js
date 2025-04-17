"use client";
import React, { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "prosemirror-state";
import { Decoration, DecorationSet } from "prosemirror-view";
import HardBreak from "@tiptap/extension-hard-break";
import "./EditorStyles.css";

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

// CustomFocus 확장 수정
const CustomFocus = Extension.create({
  name: "customFocus",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey("custom-focus"),
        props: {
          decorations: (state) => {
            const { doc, selection } = state;
            const decorations = [];

            // 찾고자 하는 문구들을 배열로 정의
            const targetPhrases = [
              "이사회의 역할 및 책임",
              "관리 감독 체계",
              "경영진의 역할 및 감독 프로세스"
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

        > * {
          margin-bottom: 0;
        }
      }

      th {
        background-color: #f1f3f5;
        font-weight: bold;
        text-align: left;
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

const CustomEditor = ({
  category,
  setCategory,
  selectedItem,
  selectedText,
  setSelectedText,
  currentText,
  setCurrentText,
  answer,

}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [inputContents, setInputContents] = useState("");
  const [years, setYears] = useState(["2024"]);
  const [subsidiaries, setSubsidiaries] = useState([
    "종속기업 없음(지배 기업만 공시)",
  ]);
  const [categories, setCategories] = useState([
    "Category 1 제품 서비스 구매",
    "Category 2 자본",
    "Category 3 구매연료/에너지",
    "Category 4 Upstream 운송&유통",
    "Category 5 사업장 발생 폐기물",
  ]);

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        paragraph: {
          keepMarks: true,
        },
      }),
      CustomFocus,
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
    ],
    content: "", // 초기 내용을 비워둡니다.
    onFocus: () => setIsFocused(true),
    onBlur: () => setIsFocused(false),
  });

  const handleCategoryChange = () => {
    setCategory("");
    const categories = {
      "이사회의 역할 및 책임": "가",
      "관리 감독 체계": "나",
      "경영진의 역할 및 감독 프로세스": "다",
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
        <h1 style="font-weight: 700;">거버넌스</h1>
        <h2>기후 관련 위험 및 기회에 관한 이사회 차원의 감독</h2>
        <p><b>이사회의 역할 및 책임</b><br/>${answer[0]?.answer || ''}</p>
        <br/>
        <p><b>관리 감독 체계</b><br/>${answer[1]?.answer || ''}</p>
      `;
      setInputContents(content);
      
      // answer가 업데이트되면 currentText도 업데이트
      const sections = [];
      if (answer[0]) {
        sections.push(`이사회의 역할 및 책임${answer[0]}`);
      }
      if (answer[1]) {
        sections.push(`관리 감독 체계${answer[1]}`);
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
        <h1 style="font-weight: 700;">거버넌스</h1>
        <h2>기후 관련 위험 및 기회에 관한 경영진의 역할</h2>
        <p><b>경영진의 역할 및 감독 프로세스</b><br/>${answer[2]?.answer || ''}</p>
      `);
    } else if (selectedItem === "indicator") {
      setInputContents(`
        <h1 style="font-weight: 700;">지표 및 목표</h1>
        <h2>기후 관련 지표</h2>
        <p>(1)온실가스 배출량</p>
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
    const specialSubsidiaries = ["마이크로소프트"];
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
                  content: [{ type: "text", text: "합계" }],
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
                  content: [{ type: "text", text: "합계" }],
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
                      content: [{ type: "text", text: "구분" }],
                    },
                  ],
                },
                {
                  type: "tableHeader",
                  attrs: { colspan: 1, rowspan: 2 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "항목" }],
                    },
                  ],
                },
                {
                  type: "tableHeader",
                  attrs: { colspan: 1, rowspan: 2 },
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "단위" }],
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
                        { type: "text", text: "온실가스 직접배출 (Scope 1)" },
                      ],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "CO2 총 배출량" }],
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
                      content: [{ type: "text", text: "집약도" }],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "배출 10억원당 기준" }],
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
                      content: [{ type: "text", text: "집약도" }],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "직원1인당 기준" }],
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
                        { type: "text", text: "온실가스 간접배출 (Scope 2)" },
                      ],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "CO2 총 배출량" }],
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
                      content: [{ type: "text", text: "집약도" }],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "배출 10억원당 기준" }],
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
                      content: [{ type: "text", text: "집약도" }],
                    },
                  ],
                },
                {
                  type: "tableCell",
                  content: [
                    {
                      type: "paragraph",
                      content: [{ type: "text", text: "직원1인당 기준" }],
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
              text: "* 각 연도별 합계 원단위는 A회사의 연결 기준 매출 및 구성원 수 적용",
            },
          ],
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: `각주 1) ${
                years[0]
              }년 이전은 관할 당국에서 요구받은 방법으로 산정하였고, ${
                years[years.length - 1]
              }년은 GHG 프로토콜로 산정함`,
            },
          ],
        },
        {
          type: "paragraph",
          content: [{ type: "text", text: "각주 2) 지역 기반 배출량 기준" }],
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
            { type: "paragraph", content: [{ type: "text", text: "구분" }] },
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

    const generateRow = (category, baseValue) => {
      return {
        type: "tableRow",
        content: [
          {
            type: "tableCell",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: category }],
              },
            ],
          },
          ...sortedYears.map((year, index) => {
            const value = Math.round(baseValue * (1 + index * 0.1));
            return {
              type: "tableCell",
              content: [
                {
                  type: "paragraph",
                  content: [{ type: "text", text: value.toString() }],
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

    // 기본 값 매핑 (예시)
    const baseValues = {
      "Scope3": 3000,
      "Category 1 제품 서비스 구매": 2000,
      "Category 2 자본재": 25,
      "Category 3 구매연료/에너지": 39,
      "Category 4 Upstream 운송&유통": 41,
      "Category 5 사업장 발생 폐기물": 18,
      // ... 다른 카테고리들에 대한 기본값 추가
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
          type: "table",
          content: tableContent,
        },
        {
          type: "paragraph",
          content: [
            {
              type: "text",
              text: "* 집계 범위: A회사 및 자회사(종속기업 1, 2, 3, 4)",
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
        "이사회의 역할 및 책임",
        "관리 감독 체계",
        "경영진의 역할 및 감독 프로세스"
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
