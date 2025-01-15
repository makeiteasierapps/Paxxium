import { useEffect } from 'react';
import {
    Popper,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
    styled,
} from '@mui/material';

// Style the highlighted item
const StyledListItemButton = styled(ListItemButton)(
    ({ theme, isHighlighted }) => ({
        backgroundColor: isHighlighted
            ? theme.palette.action.hover
            : 'transparent',
        '&:hover': {
            backgroundColor: theme.palette.action.hover,
        },
    })
);

const MentionMenu = ({
    anchorEl,
    options,
    onSelect,
    highlightedIndex,
    className,
}) => {
    // Prevent menu from closing when clicking inside
    const handleMouseDown = (e) => {
        e.preventDefault();
    };

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
            onMouseDown={handleMouseDown}
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
                    {options.map((option, index) => (
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
