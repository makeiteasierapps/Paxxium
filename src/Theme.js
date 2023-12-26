import { createTheme, responsiveFontSizes } from '@mui/material/styles';

// Define custom blue-grey shades if needed
const customBlueGrey = {
    900: '#263238',
    800: '#37474f',
    700: '#455a64',
    600: '#546e7a',
    500: '#607d8b',
    400: '#78909c',
    300: '#90a4ae',
    200: '#b0bec5',
};

let theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: customBlueGrey[700], // primary elements like buttons, icons
            dark: customBlueGrey[800], // darker shade for contrast
        },
        secondary: {
            main: customBlueGrey[600], // secondary elements
            light: customBlueGrey[700], // lighter shade for hover states
            dark: customBlueGrey[900], // darker shade for contrast
        },
        background: {
            default: customBlueGrey[900], // main background
            paper: customBlueGrey[900], // backgrounds of elements like cards, modals
        },
        text: {
            primary: '#ffffff', // white text for readability
            secondary: customBlueGrey[200], // secondary text, lighter for contrast
            disabled: customBlueGrey[400], // disabled text
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: 'none',
                    backgroundColor: customBlueGrey[700], // Button background
                    '&:hover': {
                        backgroundColor: customBlueGrey[600], // Button hover state
                    },
                },
            },
        },
    },
});

theme = responsiveFontSizes(theme);

export default theme;
