import React, { useState, useRef } from 'react';
import { EditorState, ContentState, Modifier, convertFromHTML, convertToRaw } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';

function TextEditor() {
  const [editorState, setEditorState] = useState(() => {
    const defaultContent = `(가) Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

(나) Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.

(다) At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus.

(라) Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.`;

    // 콘텐츠를 (가), (나), (다), (라) 기준으로 분할
    const contentGroups = defaultContent.split(/(?=\([가-힣]\))/);

    // HTML 형식으로 콘텐츠 생성
    const contentWithIds = contentGroups.map((group, index) => 
      `<div id="group-${index}">${group.trim()}</div>`
    ).join('');

    // HTML을 ContentState로 변환
    const blocksFromHTML = convertFromHTML(contentWithIds);
    const contentState = ContentState.createFromBlockArray(
      blocksFromHTML.contentBlocks,
      blocksFromHTML.entityMap
    );

    return EditorState.createWithContent(contentState);
  });

  // 선택된 그룹의 ID를 추적하는 state
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const [selectedGroupState, setSelectedGroupState] = useState(null);
  const editorRef = useRef(null);

  const onEditorStateChange = (newEditorState) => {
    if (selectedGroupId) {
      const newContent = newEditorState.getCurrentContent();
      const newContentRaw = convertToRaw(newContent);
      const fullContent = editorState.getCurrentContent();
      const fullContentRaw = convertToRaw(fullContent);

      const updatedBlocks = fullContentRaw.blocks.map(block => {
        if (block.key.startsWith(selectedGroupId)) {
          const newBlock = newContentRaw.blocks.find(b => b.key.startsWith(selectedGroupId));
          return newBlock || block;
        }
        return block;
      });

      const updatedContentState = ContentState.createFromBlockArray(updatedBlocks);
      setEditorState(EditorState.createWithContent(updatedContentState));
      setSelectedGroupState(newEditorState);
    } else {
      setEditorState(newEditorState);
    }
  };

  // 그룹 클릭 핸들러 수정
  const handleGroupClick = (event) => {
    const clickedElement = event.target;
    const clickedGroupId = clickedElement.id || clickedElement.closest('div[id^="group-"]')?.id;
    if (clickedGroupId && clickedGroupId.startsWith('group-')) {
      setSelectedGroupId(clickedGroupId);
      console.log('Clicked group:', clickedGroupId);

      // 선택된 그룹의 내용으로 새 EditorState 생성
      const contentState = editorState.getCurrentContent();
      const blocks = contentState.getBlocksAsArray();
      const groupBlocks = blocks.filter(block => block.getKey().startsWith(clickedGroupId));
      const groupContent = ContentState.createFromBlockArray(groupBlocks);
      setSelectedGroupState(EditorState.createWithContent(groupContent));

      // 에디터에 포커스
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focusEditor();
        }
      }, 0);
    }
  };

  // 커스텀 스타일맵 수정
  const customStyleMap = {
    HIGHLIGHT: {
      backgroundColor: 'lightyellow',
      padding: '2px',
      borderRadius: '4px',
    },
  };

  // 박스 스타일을 위한 CSS 클래스
  const boxStyle = {
    border: '1px solid #ccc',
    borderRadius: '4px',
    padding: '10px',
    marginBottom: '10px',
  };

  const selectedBoxStyle = {
    ...boxStyle,
    borderColor: 'blue',
    boxShadow: '0 0 5px rgba(0, 0, 255, 0.5)',
  };

  // 에디터 컨텐츠를 렌더링하는 함수
  const renderContent = () => {
    const contentState = editorState.getCurrentContent();
    const blocks = contentState.getBlocksAsArray();

    let currentGroup = [];
    const groups = [];

    blocks.forEach((block, index) => {
      const text = block.getText();
      if (text.match(/^\([가-힣]\)/)) {
        if (currentGroup.length > 0) {
          groups.push(currentGroup);
        }
        currentGroup = [block];
      } else {
        currentGroup.push(block);
      }
    });

    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }

    return groups.map((group, groupIndex) => {
      const groupId = `group-${groupIndex}`;
      const isSelected = groupId === selectedGroupId;

      return (
        <div
          key={groupId}
          id={groupId}
          className={`content-group ${isSelected ? 'selected' : ''}`}
          onClick={handleGroupClick}
          style={isSelected ? selectedBoxStyle : boxStyle}
        >
          {group.map((block, blockIndex) => (
            <div key={`${groupId}-block-${blockIndex}`}>
              {block.getText()}
            </div>
          ))}
        </div>
      );
    });
  };

  return (
    <div className="text-editor">
      <div className="content-wrapper">
        {renderContent()}
      </div>
      {selectedGroupId && (
        <div>
          <p>Selected group: {selectedGroupId}</p>
          <Editor
            editorState={selectedGroupState || EditorState.createEmpty()}
            onEditorStateChange={onEditorStateChange}
            wrapperClassName="selected-group-editor"
            editorClassName="selected-group-editor-content"
            ref={editorRef}
          />
        </div>
      )}
    </div>
  );
}

export default TextEditor;
