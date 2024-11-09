import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const MessageBox = styled(Box)(({ theme }) => ({
    marginLeft: theme.spacing(2),
    color: theme.palette.text.secondary,
    padding: theme.spacing(1),
    borderRadius: theme.shape.borderRadius,
    display: 'flex',
    alignItems: 'center',
}));
