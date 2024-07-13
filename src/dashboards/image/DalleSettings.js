import { useState, useContext } from 'react';
import {
    Menu,
    MenuItem,
    Tooltip,
    Grid,
    Button,
    TextField,
    InputAdornment,
    IconButton,
} from '@mui/material';
import { styled } from '@mui/system';
import SendIcon from '@mui/icons-material/Send';

import { ImageContext } from '../../contexts/ImageContext';

const StyledButton = styled(Button)(({ theme }) => ({
    fontFamily: 'Titillium Web, sans-serif',
    fontWeight: 'bold',
    fontSize: '1rem',
    width: '110px',
    height: '40px',
    backgroundColor: 'transparent',
    '&:hover': {
        backgroundColor: theme.palette.primary.main,
        color: 'black',
    },
}));

StyledButton.defaultProps = {
    disableRipple: true,
    variant: 'outlined',
};

const DalleSettings = () => {
    const [anchorEl, setAnchorEl] = useState({});
    const open = Boolean(anchorEl);

    const {
        size,
        setSize,
        quality,
        setQuality,
        style,
        setStyle,
        generateDalleImage,
        userPrompt,
        setUserPrompt,
        setIsLoading,
        isLoading,
    } = useContext(ImageContext);

    const handleClick = (menu) => (event) => {
        setAnchorEl((prevState) => ({
            ...prevState,
            [menu]: event.currentTarget,
        }));
    };

    const handleClose = (menu) => () => {
        setAnchorEl((prevState) => ({ ...prevState, [menu]: null }));
    };

    return (
        <Grid container spacing={2} justifyContent="center">
            <Grid item container spacing={1} justifyContent="center">
                <Grid item>
                    <Tooltip title="Size" placement="top">
                        <StyledButton
                            id="size-menu-button"
                            aria-controls={
                                open ? 'demo-positioned-menu' : undefined
                            }
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleClick('size')}
                        >
                            {size}
                        </StyledButton>
                    </Tooltip>
                    <Menu
                        id="size-menu"
                        aria-labelledby="size-menu"
                        anchorEl={anchorEl['size']}
                        open={Boolean(anchorEl['size'])}
                        onClose={handleClose('size')}
                        onClick={(event) => {
                            const value = event.target.getAttribute('value');
                            if (value) {
                                setSize(value);
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
                        <MenuItem
                            onClick={handleClose('size')}
                            value={'1024x1024'}
                        >
                            1024x1024
                        </MenuItem>
                        <MenuItem
                            onClick={handleClose('size')}
                            value={'1792x1024'}
                        >
                            1792x1024
                        </MenuItem>
                        <MenuItem
                            onClick={handleClose('size')}
                            value={'1024x1792'}
                        >
                            1024x1792
                        </MenuItem>
                    </Menu>
                </Grid>
                <Grid item>
                    <Tooltip title="Quality" placement="top">
                        <StyledButton
                            id="quality-menu-button"
                            aria-controls={
                                open ? 'demo-positioned-menu' : undefined
                            }
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleClick('quality')}
                        >
                            {quality}
                        </StyledButton>
                    </Tooltip>
                    <Menu
                        id="quality-menu"
                        aria-labelledby="demo-positioned-button"
                        anchorEl={anchorEl['quality']}
                        open={Boolean(anchorEl['quality'])}
                        onClose={handleClose('quality')}
                        onClick={(event) => {
                            const value = event.target.getAttribute('value');
                            if (value) {
                                setQuality(value);
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
                        <MenuItem
                            onClick={handleClose('quality')}
                            value={'Standard'}
                        >
                            Standard
                        </MenuItem>
                        <MenuItem onClick={handleClose('quality')} value={'HD'}>
                            HD
                        </MenuItem>
                    </Menu>
                </Grid>
                <Grid item>
                    <Tooltip title="Style" placement="top">
                        <StyledButton
                            id="style-menu-button"
                            aria-controls={
                                open ? 'demo-positioned-menu' : undefined
                            }
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleClick('style')}
                        >
                            {style}
                        </StyledButton>
                    </Tooltip>
                    <Menu
                        id="demo-positioned-menu"
                        aria-labelledby="demo-positioned-button"
                        anchorEl={anchorEl['style']}
                        open={Boolean(anchorEl['style'])}
                        onClose={handleClose('style')}
                        onClick={(event) => {
                            const value = event.target.getAttribute('value');
                            if (value) {
                                setStyle(value);
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
                        <MenuItem
                            onClick={handleClose('style')}
                            value={'Vivid'}
                        >
                            Vivid
                        </MenuItem>
                        <MenuItem
                            onClick={handleClose('style')}
                            value={'Natural'}
                        >
                            Natural
                        </MenuItem>
                    </Menu>
                </Grid>
            </Grid>
            <Grid item xs={12} container justifyContent="center">
                <Grid item xs={6}>
                    <TextField
                        fullWidth
                        multiline
                        variant="outlined"
                        label="Image Prompt"
                        value={userPrompt}
                        onChange={(event) => {
                            setUserPrompt(event.target.value);
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        id="search-button"
                                        onChange={(event) => {
                                            setUserPrompt(event.target.value);
                                        }}
                                        onClick={(event) => {
                                            event.preventDefault();
                                            setIsLoading(true);
                                            const imageRequest = {
                                                size: size,
                                                quality: quality,
                                                style: style,
                                                prompt: userPrompt,
                                            };
                                            generateDalleImage(imageRequest);
                                        }}
                                        disabled={!userPrompt || isLoading}
                                    >
                                        <SendIcon />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                </Grid>
            </Grid>
        </Grid>
    );
};

export default DalleSettings;
