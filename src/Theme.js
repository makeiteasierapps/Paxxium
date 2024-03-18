import { grey } from '@mui/material/colors';
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
            main: '#66CCCC', // primary elements like buttons, icons
            dark: '#66CCCC', // darker shade for contrast
        },
        secondary: {
            main: '#66CCCC', // secondary elements
            light: '#66CCCC', // lighter shade for hover states
            dark: '#66CCCC', // darker shade for contrast
        },
        background: {
            default: 'black', // main background
            paper: 'black', // backgrounds of elements like cards, modals
            agent: 'black',
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
                    textTransform: 'none',
                    backgroundColor: '#CC00FF', // Button background
                    '&:hover': {
                        backgroundColor: '#3891a6', // Button hover state
                    },
                },
            },
        },
    },
});

theme = responsiveFontSizes(theme);

export default theme;
