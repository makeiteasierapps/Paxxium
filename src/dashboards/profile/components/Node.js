import { useState, useContext, useEffect, useRef } from 'react';
import {
    Box,
    Typography,
    TextField,
    styled,
    InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { AnimatePresence, motion } from 'framer-motion';
import SendIcon from '@mui/icons-material/Send';
import { StyledIconButton } from '../../chat/chatStyledComponents';
import {
    StyledRootNode,
    StyledQuestionNode,
    StyledCategoryNode,
    InputContainer,
} from '../styledProfileComponents';
import { ProfileContext } from '../../../contexts/ProfileContext';
import { SettingsContext } from '../../../contexts/SettingsContext';

const StyledShadowWrapper = styled('div')(({ theme }) => ({
    filter: `drop-shadow(0px 0px 10px ${theme.palette.primary.main})`,
}));

const RootNode = ({ node, onClick }) => {
    const { avatar } = useContext(SettingsContext);
    return (
        <StyledShadowWrapper>
            <StyledRootNode
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClick}
                sx={{
                    backgroundImage: `url(${avatar})`,
                }}
            />
        </StyledShadowWrapper>
    );
};

const QuestionNode = ({ node, onClick }) => {
    return (
        <StyledShadowWrapper>
            <StyledQuestionNode
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClick}
            >
                <Typography
                    variant="body2"
                    sx={{ textAlign: 'center', padding: '5px' }}
                >
                    {node.name}
                </Typography>
            </StyledQuestionNode>
        </StyledShadowWrapper>
    );
};

const CategoryNode = ({ node, onClick }) => {
    return (
        <StyledShadowWrapper>
            <StyledCategoryNode
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClick}
            >
                <Typography
                    variant="body2"
                    sx={{ textAlign: 'center', padding: '5px' }}
                >
                    {node.name}
                </Typography>
            </StyledCategoryNode>
        </StyledShadowWrapper>
    );
};

const AnswerNode = ({ node, onClick }) => {
    const [answer, setAnswer] = useState('');
    const { updateAnswer } = useContext(ProfileContext);

    const handleSaveAnswer = (e, node) => {
        updateAnswer(node.id, answer);
    };

    return (
        <InputContainer sx={{ height: '70%', width: '90vw' }}>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    height: '300px',
                }}
            >
                <StyledIconButton
                    onClick={onClick}
                    sx={{ position: 'absolute', top: '10px', left: '10px' }}
                    aria-label="close"
                >
                    <CloseIcon />
                </StyledIconButton>
                <Typography
                    variant="h5"
                    sx={{
                        width: '60%',
                        textAlign: 'center',
                        paddingTop: '20px',
                        fontFamily: 'Roboto, sans-serif',
                    }}
                >
                    {node.name}
                </Typography>
                {node.answer && (
                    <Typography
                        variant="body1"
                        sx={{
                            textAlign: 'center',
                            marginTop: '10px',
                            fontFamily: 'Roboto, sans-serif',
                        }}
                    >
                        {node.answer}
                    </Typography>
                )}
                <TextField
                    autoFocus
                    variant="outlined"
                    value={answer}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <StyledIconButton
                                    disabled={!answer}
                                    disableRipple
                                    aria-label="answer input field"
                                    onClick={() => {
                                        handleSaveAnswer(answer, node);
                                        setAnswer('');
                                    }}
                                >
                                    <SendIcon />
                                </StyledIconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '40px',
                        },
                        marginBottom: '20px',
                        width: '90%',
                    }}
                    onChange={(e) => setAnswer(e.target.value)}
                />
            </Box>
        </InputContainer>
    );
};

const Node = ({ node, x, y }) => {
    const { nodes, updateNode } = useContext(ProfileContext);
    const childNodes = nodes.filter((n) => n.parentId === node.id);

    const handleClick = () => {
        updateNode(node.id, { isExpanded: !node.isExpanded });
    };

    const getNodeComponent = () => {
        switch (node.type) {
            case 'root':
                return <RootNode node={node} onClick={handleClick} />;
            case 'category':
                return <CategoryNode node={node} onClick={handleClick} />;
            case 'question':
                return <QuestionNode node={node} onClick={handleClick} />;
            case 'answer':
                return <AnswerNode node={node} onClick={handleClick} />;
            default:
                return null;
        }
    };

    return (
        <g transform={`translate(${x}, ${y})`}>
            {getNodeComponent()}
            {node.isExpanded &&
                childNodes.map((child, index) => (
                    <Node
                        key={child.id}
                        node={child}
                        x={(index - (childNodes.length - 1) / 2) * 100}
                        y={100}
                    />
                ))}
        </g>
    );
};

export default Node;
