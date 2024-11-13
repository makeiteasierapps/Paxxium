import { useContext, useState } from 'react';
import { Box, Paper, IconButton, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-ini';
import 'ace-builds/src-noconflict/theme-solarized_dark';
import { SystemContext } from '../../contexts/SystemContext';
import { StyledIconButton } from '../chat/chatStyledComponents';
import ExpandableInput from './ExpandableInput';

const ConfigFileEditor = () => {
    const { selectedFile, saveFileContent, updateFileCommands } =
        useContext(SystemContext);
    const filename = selectedFile?.path.split('/').pop();

    const [expandedInput, setExpandedInput] = useState(null);

    return (
        <Box
            id="config-file-editor"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                padding: 2,
            }}
        >
            {selectedFile && (
                <Paper
                    elevation={2}
                    sx={{
                        p: 1.5,
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        gap: 1.5, // Added gap between header and editor
                    }}
                >
                    <Box
                        display="flex"
                        alignItems="center"
                        flexDirection={'row'}
                        justifyContent={'space-between'}
                        width="100%"
                    >
                        <Box display="flex">
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 500,
                                    color: 'primary.main',
                                }}
                            >
                                {filename}
                            </Typography>
                        </Box>
                        <Box display="flex" alignItems="center" gap={1}>
                            <ExpandableInput
                                value={selectedFile?.test_command}
                                placeholder="Test command"
                                buttonText="Test"
                                expanded={expandedInput === 'test'}
                                onExpand={(expanded) =>
                                    setExpandedInput(expanded ? 'test' : null)
                                }
                                onSubmit={(value) => {
                                    console.log('Test command:', value);
                                    setExpandedInput(null);
                                    updateFileCommands(null, value);
                                }}
                            />
                            <ExpandableInput
                                value={selectedFile?.restart_command}
                                placeholder="Restart command"
                                buttonText="Restart"
                                expanded={expandedInput === 'restart'}
                                onExpand={
                                    (expanded) =>
                                        setExpandedInput(
                                            expanded ? 'restart' : null
                                        ) // Update this line
                                }
                                onSubmit={(value) => {
                                    console.log('Restart command:', value);
                                    setExpandedInput(null);
                                    updateFileCommands(value, null);
                                }}
                            />
                            <StyledIconButton
                                onClick={saveFileContent}
                                disabled={!selectedFile}
                                sx={{
                                    color: 'primary.main',
                                }}
                                size="large"
                            >
                                <SaveIcon />
                            </StyledIconButton>
                        </Box>
                    </Box>
                    <Paper
                        elevation={4}
                        sx={{
                            borderRadius: 1,
                            overflow: 'hidden', // Ensures the editor respects border radius
                        }}
                    >
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
                            width="100%"
                            height="600px"
                            fontSize={14}
                            showPrintMargin={false}
                            setOptions={{
                                showLineNumbers: true,
                                tabSize: 4,
                            }}
                        />
                    </Paper>
                </Paper>
            )}
        </Box>
    );
};

export default ConfigFileEditor;
