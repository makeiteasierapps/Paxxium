import { createTheme, responsiveFontSizes } from '@mui/material/styles';

let theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#64B5F6', // A softer blue
            dark: '#1E88E5',
        },
        secondary: {
            main: '#81C784', // A pleasant green
            light: '#A5D6A7',
            dark: '#66BB6A',
        },
        background: {
            default: 'rgb(18, 18, 18)',
            paper: 'rgb(18, 18, 18)',
            agent: 'rgb(18, 18, 18)',
            user: 'rgb(53, 53, 76)',
        },
        text: {
            primary: 'rgba(255, 255, 255, 0.87)',
            secondary: '#90CAF9', // Light blue
            disabled: 'rgba(158, 158, 158, 0.6)',
        },
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    variant: 'outlined',
                    textTransform: 'none',
                    backgroundColor: 'transparent',
                    '&:hover': {
                        backgroundColor: 'rgba(100, 181, 246, 0.12)', // Subtle hover effect
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
    typography: {
        fontFamilies: {
            primary: 'Titillium Web',
            title: 'Alegreya Sans SC',
        },
        applyFontFamily: function (fontKey) {
            return {
                fontFamily: this.fontFamilies[fontKey] || this.fontFamily,
            };
        },
    },
});

theme = responsiveFontSizes(theme);

export default theme;
