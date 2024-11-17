import { useContext, useState } from 'react';
import { Box, Paper, IconButton, Typography } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-ini';
import 'ace-builds/src-noconflict/theme-solarized_dark';
import CloseIcon from '@mui/icons-material/Close';
import { SystemContext } from '../../contexts/SystemContext';
import { StyledIconButton } from '../chat/chatStyledComponents';
import ExpandableInput from './ExpandableInput';

const ConfigFileEditor = () => {
    const {
        selectedFile,
        saveFileContent,
        updateFileCommands,
        setSelectedFile,
    } = useContext(SystemContext);
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
                        padding: '6px 16px 16px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        width: '100%',
                        gap: 1.5,
                        position: 'relative',
                    }}
                >
                    <Box
                        sx={{
                            position: 'absolute',
                            top: -4,
                            left: 0,
                            zIndex: 1000,
                        }}
                    >
                        <StyledIconButton
                            onClick={() => setSelectedFile(null)}
                            sx={{
                                color: 'primary.main',
                                opacity: 0.5,
                                '& .MuiSvgIcon-root': { fontSize: 16 },
                            }}
                        >
                            <CloseIcon />
                        </StyledIconButton>
                    </Box>

                    <Box
                        display="flex"
                        alignItems="center"
                        flexDirection={'row'}
                        justifyContent={'space-between'}
                        width="100%"
                        pr={2}
                        pl={2}
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
                                    setExpandedInput(null);
                                    updateFileCommands(null, value);
                                }}
                            />
                            <ExpandableInput
                                value={selectedFile?.restart_command}
                                placeholder="Restart command"
                                buttonText="Restart"
                                expanded={expandedInput === 'restart'}
                                onExpand={(expanded) =>
                                    setExpandedInput(
                                        expanded ? 'restart' : null
                                    )
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
