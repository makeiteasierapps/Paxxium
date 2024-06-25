import { useContext } from 'react';
import { Box, Typography, TextField, Button, Slider } from '@mui/material';
import { Delete } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { StyledIconButton } from '../../agents/agentStyledComponents';
import { getEncoding } from 'js-tiktoken';
import { Dropdown } from '@mui/base/Dropdown';
import { MenuButton as BaseMenuButton } from '@mui/base/MenuButton';
import { Menu } from '@mui/base/Menu';
import { MenuItem as BaseMenuItem, menuItemClasses } from '@mui/base/MenuItem';
import { ProjectContext } from '../ProjectContext';

const encoding = getEncoding('cl100k_base');

const MainUtilityBox = styled(Box)({
    display: 'flex',
    justifyContent: 'space-between',
    width: '100%',
    padding: '10px',
});

const TextInputUtilityBar = ({ document }) => {
    const {
        highlightsManager: {
            selectedChunk,
            handleColorChange,
            handleRangeSliderChange,
            handleDelete,
        },
        documentManager: {
            handleSave,
            handleEmbed,
            category,
            setCategory,
            documentText,
        },
    } = useContext(ProjectContext);

    const categories = ['Personal', 'Project', 'Skills', 'Education'];

    const createHandleMenuClick = (menuItem) => {
        return () => {
            console.log(`Clicked on ${menuItem}`);
            setCategory(menuItem);
        };
    };

    return (
        <MainUtilityBox>
            {selectedChunk && (
                <>
                    <Box>
                        <Typography>Token Count:</Typography>
                        <Typography>
                            {encoding.encode(selectedChunk?.text || '').length}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Typography>Color:</Typography>
                        <Slider
                            value={parseInt(selectedChunk.color.slice(1), 16)}
                            onChange={handleColorChange}
                            min={0}
                            max={0xffffff}
                            step={1}
                        />
                    </Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                            }}
                        >
                            <Typography sx={{ paddingRight: '5px' }}>
                                Range:
                            </Typography>
                            <TextField
                                label="Start"
                                type="number"
                                value={selectedChunk.start}
                                onChange={(e) =>
                                    handleRangeSliderChange(null, [
                                        Number(e.target.value),
                                        selectedChunk.end,
                                    ])
                                }
                                inputProps={{
                                    min: 0,
                                    max: documentText.length,
                                }}
                            />
                            <TextField
                                label="End"
                                type="number"
                                value={selectedChunk.end}
                                onChange={(e) =>
                                    handleRangeSliderChange(null, [
                                        selectedChunk.start,
                                        Number(e.target.value),
                                    ])
                                }
                                inputProps={{
                                    min: 0,
                                    max: documentText.length,
                                }}
                            />
                        </Box>
                    </Box>
                    <StyledIconButton onClick={handleDelete}>
                        <Delete />
                    </StyledIconButton>
                </>
            )}

            <Dropdown>
                <MenuButton>
                    {category ? category : 'Choose Category'}
                </MenuButton>
                <Menu slots={{ listbox: Listbox }}>
                    {categories.map((cat) => (
                        <MenuItem
                            key={cat}
                            onClick={createHandleMenuClick(cat)}
                        >
                            {cat}
                        </MenuItem>
                    ))}
                </Menu>
            </Dropdown>
            <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                    handleSave(document.project_id);
                }}
            >
                Save
            </Button>
            <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                    handleEmbed(document.project_id);
                }}
            >
                Embed
            </Button>
        </MainUtilityBox>
    );
};

export default TextInputUtilityBar;

const blue = {
    50: '#F0F7FF',
    100: '#C2E0FF',
    200: '#99CCF3',
    300: '#66B2FF',
    400: '#3399FF',
    500: '#007FFF',
    600: '#0072E6',
    700: '#0059B3',
    800: '#004C99',
    900: '#003A75',
};

const grey = {
    50: '#F3F6F9',
    100: '#E5EAF2',
    200: '#DAE2ED',
    300: '#C7D0DD',
    400: '#B0B8C4',
    500: '#9DA8B7',
    600: '#6B7A90',
    700: '#434D5B',
    800: '#303740',
    900: '#1C2025',
};

const Listbox = styled('ul')(
    ({ theme }) => `
    font-family: 'IBM Plex Sans', sans-serif;
    font-size: 0.875rem;
    box-sizing: border-box;
    padding: 6px;
    margin: 12px 0;
    min-width: 200px;
    border-radius: 12px;
    overflow: auto;
    outline: 0px;
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    box-shadow: 0px 4px 6px ${
        theme.palette.mode === 'dark'
            ? 'rgba(0,0,0, 0.50)'
            : 'rgba(0,0,0, 0.05)'
    };
    z-index: 1;
    `
);

const MenuItem = styled(BaseMenuItem)(
    ({ theme }) => `
    list-style: none;
    padding: 8px;
    border-radius: 8px;
    cursor: default;
    user-select: none;
  
    &:last-of-type {
      border-bottom: none;
    }
  
    &:focus {
      outline: 3px solid ${theme.palette.mode === 'dark' ? blue[600] : blue[200]};
      background-color: ${theme.palette.mode === 'dark' ? grey[800] : grey[100]};
      color: ${theme.palette.mode === 'dark' ? grey[300] : grey[900]};
    }
  
    &.${menuItemClasses.disabled} {
      color: ${theme.palette.mode === 'dark' ? grey[700] : grey[400]};
    }
    `
);

const MenuButton = styled(BaseMenuButton)(
    ({ theme }) => `
    font-family: 'IBM Plex Sans', sans-serif;
    font-weight: 600;
    font-size: 0.875rem;
    line-height: 1.5;
    padding: 8px 16px;
    border-radius: 8px;
    color: white;
    transition: all 150ms ease;
    cursor: pointer;
    background: ${theme.palette.mode === 'dark' ? grey[900] : '#fff'};
    border: 1px solid ${theme.palette.mode === 'dark' ? grey[700] : grey[200]};
    color: ${theme.palette.mode === 'dark' ? grey[200] : grey[900]};
    box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  
    &:hover {
      background: ${theme.palette.mode === 'dark' ? grey[800] : grey[50]};
      border-color: ${theme.palette.mode === 'dark' ? grey[600] : grey[300]};
    }
  
    &:active {
      background: ${theme.palette.mode === 'dark' ? grey[700] : grey[100]};
    }
  
    &:focus-visible {
      box-shadow: 0 0 0 4px ${theme.palette.mode === 'dark' ? blue[300] : blue[200]};
      outline: none;
    }
    `
);
