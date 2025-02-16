import React from 'react';
import { Menu, MenuItem } from '@mui/material';

const ModelMenu = ({
    anchorEl,
    setAnchorEl,
    updateSelectedChat,
    handleUpdateSettings,
}) => {
    const handleClose = (menu) => () => {
        setAnchorEl((prevState) => ({ ...prevState, [menu]: null }));
    };

    return (
        <Menu
            id="model-menu"
            anchorEl={anchorEl['model']}
            open={Boolean(anchorEl['model'])}
            onClose={handleClose('model')}
            onClick={(event) => {
                const value = event.target.getAttribute('value');
                if (value) {
                    updateSelectedChat({ agent_model: value });
                    handleUpdateSettings({ agent_model: value });
                }
            }}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
        >
            <MenuItem value={'gpt-4o-mini'} onClick={handleClose('model')}>
                GPT-4o-mini
            </MenuItem>
            <MenuItem value={'chatgpt-4o-latest'} onClick={handleClose('model')}>
                GPT-4o
            </MenuItem>
            <MenuItem value={'o1'} onClick={handleClose('model')}>
                o1
            </MenuItem>
            <MenuItem value={'o3-mini'} onClick={handleClose('model')}>
                o3-mini
            </MenuItem>
            <MenuItem
                value={'claude-3-5-sonnet-latest'}
                onClick={handleClose('model')}
            >
                Claude 3.5 Sonnet
            </MenuItem>
        </Menu>
    );
};

export default ModelMenu;
