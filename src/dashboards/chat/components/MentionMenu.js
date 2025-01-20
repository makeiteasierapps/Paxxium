import { useEffect, useContext } from 'react';
import {
    Popper,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    styled,
} from '@mui/material';
import { ContextManagerContext } from '../../../contexts/ContextManagerContext';

// Style the highlighted item
const StyledListItemButton = styled(ListItemButton, {
    shouldForwardProp: (prop) => prop !== 'isHighlighted',
})(({ theme, isHighlighted }) => ({
    backgroundColor: isHighlighted ? theme.palette.action.hover : 'transparent',
    '&:hover': {
        backgroundColor: theme.palette.action.hover,
    },
}));

const MentionMenu = ({
    anchorEl,
    options,
    onSelect,
    highlightedIndex,
    className,
}) => {
    const { contextItems } = useContext(ContextManagerContext);
    // Filter out already selected mentions
    const filteredOptions = options.filter(
        (option) => !contextItems?.kbs?.some((kb) => kb.name === option)
    );

    // Scroll highlighted item into view
    useEffect(() => {
        if (highlightedIndex >= 0) {
            const element = document.getElementById(
                `mention-option-${highlightedIndex}`
            );
            if (element) {
                element.scrollIntoView({ block: 'nearest' });
            }
        }
    }, [highlightedIndex]);

    return (
        <Popper
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            placement="top-start"
            className={className}
            style={{ zIndex: 1300 }}
        >
            <Paper
                elevation={3}
                sx={{
                    maxHeight: '200px',
                    overflow: 'auto',
                    width: '200px',
                }}
            >
                <List>
                    {filteredOptions.map((option, index) => (
                        <ListItem
                            disablePadding
                            key={index}
                            id={`mention-option-${index}`}
                        >
                            <StyledListItemButton
                                onClick={() => onSelect(option)}
                                isHighlighted={index === highlightedIndex}
                                onMouseEnter={() => {
                                    // Optional: Update highlighted index on hover
                                    // setHighlightedIndex(index);
                                }}
                            >
                                <ListItemText
                                    primary={option}
                                    primaryTypographyProps={{
                                        noWrap: true,
                                    }}
                                />
                            </StyledListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Popper>
    );
};

export default MentionMenu;
