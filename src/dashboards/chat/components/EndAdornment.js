import { useRef, useContext } from 'react';
import { Tooltip, InputAdornment } from '@mui/material';
import { StyledIconButton } from '../chatStyledComponents';
import SendIcon from '@mui/icons-material/Send';
import AddBox from '@mui/icons-material/AddBox';
import { ContextManagerContext } from '../../../contexts/ContextManagerContext';

const EndAdornment = ({ onSendMessage, input, setInput }) => {
    const { onFileSelect } = useContext(ContextManagerContext);
    const fileInputRef = useRef();
    const handleFileButtonClick = () => {
        fileInputRef.current.click();
    };
    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={onFileSelect}
                accept="image/jpeg,image/png,image/gif,image/webp"
            />
            <Tooltip title="add image" placement="top">
                <InputAdornment position="end">
                    <StyledIconButton
                        disableRipple
                        aria-label="add image"
                        onClick={handleFileButtonClick}
                    >
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
                        onSendMessage(input);
                        setInput('');
                    }}
                >
                    <SendIcon />
                </StyledIconButton>
            </InputAdornment>
        </>
    );
};

export default EndAdornment;
