import { createTheme } from '@mui/material/styles';

// Define custom blue-grey shades if needed
const customBlueGrey = {
    900: '#263238', // very dark blue-grey for text and accents
    800: '#37474f', // dark blue-grey for backgrounds
    700: '#455a64', // default blue-grey for primary elements
    600: '#546e7a', // lighter blue-grey for hover states
    500: '#607d8b', // lighter still for secondary elements or accents
    400: '#78909c', 
    300: '#90a4ae', 
    200: '#b0bec5', 
};

export const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: customBlueGrey[700], // primary elements like buttons, icons
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
