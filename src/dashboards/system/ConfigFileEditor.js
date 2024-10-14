import React, { useEffect } from 'react';
import { Box, Button } from '@mui/material';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-ini';
import 'ace-builds/src-noconflict/theme-solarized_dark';
import { useConfig } from '../../hooks/useConfigManager';

const ConfigFileEditor = ({ uid }) => {
    const { selectedFile, saveFileContent } = useConfig();

    const handleSave = () => {
        if (selectedFile) {
            saveFileContent(
                selectedFile.path?.replace(/^\/+/, '') || '',
                selectedFile.content || '',
                selectedFile.category
            );
        }
    };

    return (
        <Box className="config-file-editor">
            <h3>{selectedFile?.path || 'No file selected'}</h3>

            {selectedFile && (
                <>
                    <AceEditor
                        mode="ini"
                        theme="solarized_dark"
                        value={selectedFile?.content || ''}
                        onChange={(value) => {
                            if (selectedFile) {
                                selectedFile.content = value;
                            }
                        }}
                        name="config-editor"
                        editorProps={{ $blockScrolling: true }}
                        width="90vw"
                        height="60vh"
                    />
                    <Button
                        onClick={handleSave}
                        disabled={!selectedFile}
                        variant="outlined"
                        sx={{
                            mx: 1,
                            backgroundColor: 'transparent',
                            color: 'primary.main',
                            '&:hover': {
                                backgroundColor: 'primary.light',
                            },
                        }}
                    >
                        Save
                    </Button>
                </>
            )}
        </Box>
    );
};

export default ConfigFileEditor;
