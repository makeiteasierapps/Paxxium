import React from 'react';
import {
    Popper,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemButton,
} from '@mui/material';

const MentionMenu = ({ anchorEl, options, onSelect }) => {
    return (
        <Popper
            open={Boolean(anchorEl)}
            anchorEl={anchorEl}
            placement="top-start"
        >
            <Paper>
                <List>
                    {options.map((option, index) => (
                        <ListItem disablePadding key={index}>
                            <ListItemButton onClick={() => onSelect(option)}>
                                <ListItemText primary={option} />
                            </ListItemButton>
                        </ListItem>
                    ))}
                </List>
            </Paper>
        </Popper>
    );
};

export default MentionMenu;
