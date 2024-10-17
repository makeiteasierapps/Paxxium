import { useRef } from 'react';
import { Tooltip, InputAdornment } from '@mui/material';
import { StyledIconButton } from '../chatStyledComponents';
import SendIcon from '@mui/icons-material/Send';
import AddBox from '@mui/icons-material/AddBox';

const EndAdornment = ({
    onSendMessage,
    input,
    setInput,
    image,
    removeImage,
    handleFileInput,
}) => {
    const inputRef = useRef();
    return (
        <>
            <Tooltip title="add image" placement="top">
                <InputAdornment position="end">
                    <StyledIconButton
                        disableRipple
                        aria-label="add image"
                        onClick={() => inputRef.current.click()}
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
                        onSendMessage(input, image);
                        setInput('');
                        removeImage();
                    }}
                >
                    <SendIcon />
                </StyledIconButton>
            </InputAdornment>
        </>
    );
};

export default EndAdornment;
