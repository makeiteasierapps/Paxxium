import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import DeleteIcon from '@mui/icons-material/Delete';
import { Tooltip, Typography, CardActions, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { useContext, useState } from 'react';
import { NewsContext } from '../../../../contexts/NewsContext';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import {
    StyledCard,
    StyledCardMedia,
    StyledIconButton,
    StyledButton,
} from '../styledNewsComponents';

const NewsCard = ({ news, index }) => {
    const { markNewsAsRead, deleteNewsArticle, setSlideIndex } =
        useContext(NewsContext);

    const [openDialog, setOpenDialog] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9 }}
            style={{ height: '100%' }}
        >
            <StyledCard key={news._id} onClick={() => setSlideIndex(index)}>
                <StyledCardMedia image={news.image}>
                    <Tooltip title="Mark read" placement="top-end">
                        <StyledIconButton
                            disableRipple
                            style={{ right: 0 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                markNewsAsRead(news._id, !news.is_read);
                            }}
                        >
                            {news.is_read ? (
                                <CheckBoxIcon />
                            ) : (
                                <CheckBoxOutlineBlankIcon />
                            )}
                        </StyledIconButton>
                    </Tooltip>
                    <Tooltip title="Trash" placement="top-start">
                        <StyledIconButton
                            style={{ left: 0 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setOpenDialog(true);
                            }}
                        >
                            <DeleteIcon />
                        </StyledIconButton>
                    </Tooltip>
                </StyledCardMedia>
                <CardContent>
                    <Typography
                        variant="h5"
                        component="div"
                        gutterBottom
                        color="text.secondary"
                        align="center"
                    >
                        {news.title}
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.primary"
                        align="center"
                    >
                        {news.summary}
                    </Typography>
                </CardContent>
                <CardActions>
                    <StyledButton size="medium" href={news.url} target="_blank">
                        Read More
                    </StyledButton>
                </CardActions>
            </StyledCard>
            <DeleteConfirmationDialog
                open={openDialog}
                handleClose={() => setOpenDialog(false)}
                handleConfirm={() => {
                    setOpenDialog(false);
                    deleteNewsArticle(news._id);
                }}
            />
        </motion.div>
    );
};

export default NewsCard;
