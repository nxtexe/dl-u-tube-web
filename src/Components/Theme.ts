import { createTheme } from '@mui/material/styles';

export const darkTheme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            light: '#F27575',
            main: '#FF0000',
            dark: '#740000'
        },
        secondary: {
            light: '#8A8A8A',
            main: '#282828',
            dark: '#121212'
        },
        error: {
            light: '#EF9595',
            main: '#FF1A19',
            dark: '#720C0B'
        },
        warning: {
            light: '#F4D8F',
            main: '#FFCE19',
            dark: '#745E0C'
        },
        info: {
            light: '#727DF3',
            main: '#0D22DFF',
            dark: '#040B51'
        },
        success: {
            light: '#74F397',
            main: '#1AFF5A',
            dark: '#0A5D21'
        }
    }
});
