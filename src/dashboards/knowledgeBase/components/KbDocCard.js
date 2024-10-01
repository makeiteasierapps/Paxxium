import { useContext, useState, useRef } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  IconButton,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import {
  Delete,
  OpenInNew,
  ArrowBackIos,
  ArrowForwardIos,
} from "@mui/icons-material";
import { KbContext } from "../../../contexts/KbContext";
import { useTextEditorManager } from "../../../hooks/knowledgeBase/useTextEditorManager";
import { StyledIconButton } from "../../chat/chatStyledComponents";
import TextEditor from "./textEditor/TextEditor";
import Markdown from "react-markdown";

const KbDocCard = ({ document }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isFullDocDelete, setIsFullDocDelete] = useState(false);
  const deleteButtonRef = useRef(null);
  const longPressTimer = useRef(null);
  const {
    isEditorOpen,
    toggleEditor,
    handlePrevUrl,
    handleNextUrl,
    currentDocIndex,
    setDocumentDetails,
    setCurrentDocIndex,
    setEditorContent,
    editorContent,
    convertHTMLtoMarkdown,
  } = useTextEditorManager(document);

  const { deleteKbDoc, deleteKbDocPage } = useContext(KbContext);

  const handleDeleteClick = () => {
    setIsFullDocDelete(document.content.length === 1);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteMouseDown = () => {
    longPressTimer.current = setTimeout(() => {
      setIsFullDocDelete(true);
      setIsDeleteDialogOpen(true);
    }, 1000);
  };

  const handleDeleteMouseUp = () => {
    clearTimeout(longPressTimer.current);
  };

  const handleConfirmDelete = () => {
    if (isFullDocDelete || document.content.length === 1) {
      console.log("Deleting entire document");
      deleteKbDoc(document.kb_id, document.id);
    } else {
      const pageSource = document.content[currentDocIndex].metadata.sourceURL;
      deleteKbDocPage(document.kb_id, document.id, pageSource);
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card
      sx={{
        width: "100%",
        height: "500px",
        backgroundColor: "#111111",
      }}
      elevation={6}
    >
      <CardHeader
        title="Document Source"
        subheader={
          <>
            <Typography
              variant="body2"
              sx={{
                maxWidth: "90%",
                display: "inline-block",
                verticalAlign: "middle",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {document.source}
            </Typography>
            {document.content.length > 1 && (
              <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                Page {document.content.length - currentDocIndex} of{" "}
                {document.content.length}
              </Typography>
            )}
          </>
        }
      />
      <CardContent>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            padding: 2,
            height: "300px",
            overflow: "auto",
            backgroundColor: "background.paper",
            borderRadius: 2,
            boxShadow: 1,
            overflowX: "hidden",
          }}
        >
          <Markdown
            components={{
              pre: ({ node, ...props }) => (
                <pre
                  style={{
                    overflowX: "auto",
                    maxWidth: "100%",
                  }}
                  {...props}
                />
              ),
              code: ({ node, ...props }) => (
                <code
                  style={{
                    wordBreak: "break-word",
                    whiteSpace: "pre-wrap",
                  }}
                  {...props}
                />
              ),
              img: ({ node, ...props }) => (
                <img
                  alt={props.alt}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    objectFit: "contain",
                  }}
                  {...props}
                />
              ),
              p: ({ node, ...props }) => (
                <p
                  style={{
                    overflowWrap: "break-word",
                    wordWrap: "break-word",
                  }}
                  {...props}
                />
              ),
            }}
          >
            {document.content[currentDocIndex].content || ""}
          </Markdown>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: "space-between" }}>
        <Box>
          <StyledIconButton
            onClick={handleDeleteClick}
            onMouseDown={handleDeleteMouseDown}
            onMouseUp={handleDeleteMouseUp}
            onMouseLeave={handleDeleteMouseUp}
            ref={deleteButtonRef}
          >
            <Delete />
          </StyledIconButton>
          <StyledIconButton onClick={toggleEditor}>
            <OpenInNew />
          </StyledIconButton>
        </Box>
        {document.content.length > 1 && (
          <Box>
            <IconButton onClick={handlePrevUrl}>
              <ArrowBackIos />
            </IconButton>
            <IconButton onClick={handleNextUrl}>
              <ArrowForwardIos />
            </IconButton>
          </Box>
        )}
      </CardActions>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>
          {isFullDocDelete ? "Delete Entire Document?" : "Delete Page?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {isFullDocDelete
              ? "Are you sure you want to delete the entire document? This action cannot be undone."
              : "Are you sure you want to delete this page? This action cannot be undone."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      {isEditorOpen && (
        <TextEditor
          document={document}
          setDocumentDetails={setDocumentDetails}
          currentDocIndex={currentDocIndex}
          setCurrentDocIndex={setCurrentDocIndex}
          setEditorContent={setEditorContent}
          convertHTMLtoMarkdown={convertHTMLtoMarkdown}
          isEditorOpen={isEditorOpen}
          toggleEditor={toggleEditor}
          editorContent={editorContent}
        />
      )}
    </Card>
  );
};
export default KbDocCard;
