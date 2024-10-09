import React, { useEffect } from 'react';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-ini';
import 'ace-builds/src-noconflict/theme-solarized_dark';
import { useConfig } from '../../hooks/useConfigManager';

const ConfigFileEditor = ({ uid }) => {
    const { selectedFile, saveFileContent } = useConfig();
    const handleSave = () => {
        if (selectedFile) {
            saveFileContent(
                uid,
                selectedFile.filename.replace(/^\/+/, ''),
                selectedFile.content
            );
        }
    };

    if (!selectedFile) {
        return <div className="config-file-editor">Select a file to edit</div>;
    }

    return (
        <div className="config-file-editor">
            <h3>Editing: {selectedFile.filename}</h3>
            <AceEditor
                mode="ini"
                theme="solarized_dark"
                value={selectedFile.content}
                onChange={(value) => {
                    selectedFile.content = value;
                }}
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
