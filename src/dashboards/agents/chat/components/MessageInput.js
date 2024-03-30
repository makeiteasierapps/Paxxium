import {
    useContext,
    useState,
    useRef,
    useCallback,
    forwardRef,
    useEffect,
} from 'react';
import { TextField, InputAdornment, Box, InputLabel } from '@mui/material';
import Tooltip from '@mui/material/Tooltip';
import SendIcon from '@mui/icons-material/Send';
import AddBox from '@mui/icons-material/AddBox';
import ClearIcon from '@mui/icons-material/Clear';
import { ChatContext } from '../ChatContext';
import { InputArea, StyledIconButton } from '../../agentStyledComponents';
import { styled } from '@mui/material/styles';
import { useDropzone } from 'react-dropzone';

const StyledInputTextField = styled(TextField)(({ theme }) => ({
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            border: 'none',
        },
        '&:hover fieldset': {
            border: 'none',
        },
        '&.Mui-focused fieldset': {
            border: 'none',
        },
    },
}));

const RefWrapper = forwardRef(({ isDragActive, ...other }, ref) => (
    <Box ref={ref} {...other} />
));

const StyledBox = styled(RefWrapper)(({ theme, isDragActive }) => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    position: 'relative',
    border: isDragActive
        ? '2px solid green'
        : `2px solid ${theme.palette.secondary.light}`,
    borderRadius: theme.shape.borderRadius,
}));

const StyledInputLabel = styled(
    ({ hasImage, isFocused, userMessage, ...other }) => (
        <InputLabel {...other} />
    )
)(({ theme, hasImage, isFocused, userMessage }) => ({
    position: 'absolute',
    top: '50%',
    left: hasImage ? '120px' : '12px',
    visibility: isFocused || userMessage ? 'hidden' : 'visible',
    transform: 'translateY(-50%)',
    backgroundColor: theme.palette.background.paper,
    paddingLeft: '5px',
    paddingRight: '5px',
}));

const ImageOverlay = styled(Box)(({ theme }) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    display: 'flex',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: theme.palette.common.white,
    cursor: 'pointer',
    visibility: 'hidden',
    '&:hover': {
        visibility: 'visible',
    },
}));

const MessageInput = ({
    chatId,
    agentModel,
    systemPrompt,
    chatConstants,
    useProfileData,
    isProjectChat,
}) => {
    const { sendMessage } = useContext(ChatContext);
    const [input, setInput] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
    const [isFocused, setIsFocused] = useState(false);
    const [showOverlay, setShowOverlay] = useState(false);
    const inputRef = useRef();

    useEffect(() => {
        if (image) {
            const url = URL.createObjectURL(image);
            setImagePreviewUrl(url);
            return () => URL.revokeObjectURL(url);
        }
    }, [image]);

    const chatSettings = {
        chatId,
        agentModel,
        systemPrompt,
        chatConstants,
        useProfileData,
    };

    const handleFileInput = (event) => {
        const file = event.target.files[0];
        if (file) {
            setImage(file);
        }
    };

    const onDrop = useCallback((acceptedFiles) => {
        setImage(acceptedFiles[0]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        noClick: true,
        accept: {
            'image/*': ['.png', '.gif', '.jpeg', '.jpg'],
        },
    });

    const removeImage = () => {
        setImage(null);
        setImagePreviewUrl(null);
    };

    return (
        <InputArea>
            <StyledBox {...getRootProps()} isDragActive={isDragActive}>
                <input {...getInputProps()} />
                {image && (
                    <Box
                        onMouseEnter={() => setShowOverlay(true)}
                        onMouseLeave={() => setShowOverlay(false)}
                    >
                        <img
                            width={100}
                            height="auto"
                            src={imagePreviewUrl}
                            alt="preview"
                            style={{
                                display: 'flex',
                            }}
                        />
                        <ImageOverlay
                            style={{
                                visibility: showOverlay ? 'visible' : 'hidden',
                            }}
                            onClick={removeImage}
                        >
                            <ClearIcon />
                        </ImageOverlay>
                    </Box>
                )}
                <StyledInputLabel
                    hasImage={!!image}
                    isFocused={isFocused}
                    userMessage={input}
                >
                    Type Something
                </StyledInputLabel>
                <StyledInputTextField
                    fullWidth
                    multiline
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={(event) => {
                        if (
                            event.key === 'Enter' &&
                            !event.shiftKey &&
                            input.trim() !== ''
                        ) {
                            event.preventDefault();
                            sendMessage(
                                input,
                                chatSettings,
                                image,
                            );
                            setInput('');
                            removeImage();
                        }
                    }}
                    InputProps={{
                        endAdornment: (
                            <>
                                <Tooltip title="add image" placement="top">
                                    <InputAdornment position="end">
                                        <StyledIconButton
                                            disableRipple
                                            aria-label="add image"
                                            onClick={() =>
                                                inputRef.current.click()
                                            }
                                        >
                                            <input
                                                type="file"
                                                accept="image/*"
                                                style={{ display: 'none' }}
                                                ref={inputRef}
                                                onChange={handleFileInput}
                                            />
                                            <AddBox />
                                        </StyledIconButton>
                                    </InputAdornment>
                                </Tooltip>

                                <InputAdornment position="end">
                                    <StyledIconButton
                                        disabled={!input}
                                        disableRipple
                                        aria-label="send message"
                                        onClick={() => {
                                            sendMessage(
                                                input,
                                                chatSettings,
                                                image,
                                            );
                                            setInput('');
                                            removeImage();
                                        }}
                                    >
                                        <SendIcon />
                                    </StyledIconButton>
                                </InputAdornment>
                            </>
                        ),
                    }}
                />
            </StyledBox>
        </InputArea>
    );
};

export default MessageInput;
