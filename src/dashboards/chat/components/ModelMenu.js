import React from 'react';
import { Menu, MenuItem } from '@mui/material';

const ModelMenu = ({ anchorEl, setAnchorEl, setAgentModel, handleUpdateSettings }) => {
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
                    setAgentModel(value);
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
            <MenuItem value={'gpt-4o'} onClick={handleClose('model')}>
                GPT-4o
            </MenuItem>
            <MenuItem
                value={'claude-3-5-sonnet-20240620'}
                onClick={handleClose('model')}
            >
                Claude 3.5 Sonnet
            </MenuItem>
        </Menu>
    );
};

export default ModelMenu;
