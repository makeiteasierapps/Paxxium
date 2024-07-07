import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import DeleteIcon from '@mui/icons-material/Delete';
import {
    Tooltip,
    Typography,
    CardActions,
    CardContent,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useContext, useState } from 'react';
import { NewsContext } from '../NewsContext';
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

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? `http://${process.env.REACT_APP_BACKEND_URL}`
            : `https://${process.env.REACT_APP_BACKEND_URL_PROD}`;

    const markArticleRead = async () => {
        try {
            const response = await fetch(`${backendUrl}/news`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ articleId: news.id }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }
            markNewsAsRead(news.id);
        } catch (error) {
            console.error(error);
        }
    };

    const handleArticleDelete = async () => {
        try {
            const response = await fetch(`${backendUrl}/news`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ articleId: news.id }),
            });
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }
            deleteNewsArticle(news.id);
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9 }}
            style={{ height: '100%' }}
        >
            <StyledCard key={news.id} onClick={() => setSlideIndex(index)}>
                <StyledCardMedia image={news.image}>
                    <Tooltip title="Mark read" placement="top-end">
                        <StyledIconButton
                            disableRipple
                            style={{ right: 0 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                if (!news.is_read) {
                                    markArticleRead();
                                }
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
                    handleArticleDelete();
                }}
            />
        </motion.div>
    );
};

export default NewsCard;
