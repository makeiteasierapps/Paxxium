import React, { useEffect } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-yaml';
import 'ace-builds/src-noconflict/theme-monokai';
import { useConfig } from '../hooks/useConfig';

const ConfigFileEditor = ({ uid }) => {
  const {
    selectedFile,
    fileContent,
    setFileContent,
    fetchFileContent,
    saveFileContent,
  } = useConfig();

  useEffect(() => {
    if (selectedFile) {
      fetchFileContent(uid, selectedFile);
    }
  }, [fetchFileContent, selectedFile, uid]);

  const handleSave = () => {
    if (selectedFile) {
      saveFileContent(uid, selectedFile, fileContent);
    }
  };

  if (!selectedFile) {
    return <div className="config-file-editor">Select a file to edit</div>;
  }

  return (
    <div className="config-file-editor">
      <h3>Editing: {selectedFile}</h3>
      <AceEditor
        mode="yaml"
        theme="monokai"
        value={fileContent}
        onChange={setFileContent}
        name="config-editor"
        editorProps={{ $blockScrolling: true }}
        width="100%"
        height="400px"
      />
      <button onClick={handleSave}>Save</button>
    </div>
  );
};

export default ConfigFileEditor;