import { useContext, useState } from 'react';
import { Box, Paper, IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-ini';
import 'ace-builds/src-noconflict/theme-solarized_dark';
import { SystemContext } from '../../contexts/SystemContext';
import ExpandableInput from './ExpandableInput';

const ConfigFileEditor = () => {
    const { selectedFile, saveFileContent, updateFileCommands } =
        useContext(SystemContext);
    console.log(selectedFile?.test_command);

    const [expandedInput, setExpandedInput] = useState(null);

    return (
        <Box
            id="config-file-editor"
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                width: '100%',
            }}
        >
            {selectedFile && (
                <>
                    <Paper
                        elevation={2}
                        display="flex"
                        flexDirection="column"
                        width="100%"
                        sx={{
                            p: 1,
                        }}
                    >
                        <Box
                            display="flex"
                            alignItems="center"
                            flexDirection={'row'}
                            gap={1}
                            justifyContent={'flex-end'}
                            width="100%"
                        >
                            <ExpandableInput
                                initialValue={selectedFile?.test_command}
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
                                initialValue={selectedFile?.restart_command}
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
                            <IconButton
                                onClick={saveFileContent}
                                disabled={!selectedFile}
                                color="primary"
                                size="large"
                                sx={{
                                    '&:hover': {
                                        backgroundColor: 'primary.light',
                                    },
                                }}
                            >
                                <SaveIcon />
                            </IconButton>
                        </Box>
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
                        />
                    </Paper>
                </>
            )}
        </Box>
    );
};

export default ConfigFileEditor;
