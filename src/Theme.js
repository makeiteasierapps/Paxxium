import { grey } from '@mui/material/colors';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#66CCCC', // primary elements like buttons, icons
            dark: '#66CCCC', // darker shade for contrast
        },
        secondary: {
            main: '#66CCCC', // secondary elements
            light: '#66CCCC', // lighter shade for hover states
            dark: '#66CCCC', // darker shade for contrast
        },
        background: {
            default: '#000', // main background
            paper: '#000', // backgrounds of elements like cards, modals
            agent: '#000',
            user: '#660099',
        },
        text: {
            primary: '#ffffff', // white text for readability
            secondary: '#66CCCC', // secondary text, lighter for contrast
            disabled: grey, // dark grey
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    variant: 'outlined',
                    textTransform: 'none',
                    backgroundColor: 'transparent', // Button background
                    '&:hover': {
                        backgroundColor: '#3891a6', // Button hover state
                    },
                },
            },
        },
        MuiSpeedDial: {
            styleOverrides: {
                fab: {
                    backgroundColor: '#66CCCC',
                },
            },
        },
        MuiOutlinedInput: {
            styleOverrides: {
                root: {
                    '& fieldset': {
                        borderColor: '#66CCCC',
                    },
                    '&:hover fieldset': {
                        borderColor: '#66CCCC',
                    },
                    '&.Mui-disabled fieldset': {
                        borderColor: '#66CCCC',
                    },
                },
            },
        },
    },
});

theme = responsiveFontSizes(theme);

export default theme;
