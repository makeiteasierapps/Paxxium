import { useContext } from 'react';
import { Box, Paper, IconButton } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-ini';
import 'ace-builds/src-noconflict/theme-solarized_dark';
import { SystemContext } from '../../contexts/SystemContext';
import ExpandableInput from './ExpandableInput';

const ConfigFileEditor = () => {
    const { selectedFile, saveFileContent } = useContext(SystemContext);

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
                                initialValue={selectedFile?.name}
                                placeholder="File name"
                                onSubmit={(value) => {
                                    console.log(value);
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
