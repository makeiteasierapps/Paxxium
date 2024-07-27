import { useState, useContext, useCallback } from 'react';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { AuthContext } from '../../contexts/AuthContext';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export const useTextEditorManager = (
    selectedKb,
    editorContent,
    setEditorContent,
    highlights,
    setHighlights,
    backendUrl,
    setKbDocs
) => {
    const [textDocId, setTextDocId] = useState(null);
    const { showSnackbar } = useContext(SnackbarContext);
    const { uid } = useContext(AuthContext);
    const kbId = selectedKb ? selectedKb.id : null;

    const cleanEditorContent = (content) => {
        // I need to finda solution that cleans without removing the markdown
        // I am converting markdown to html so that in can render in quill
        // I need to convert it back to markdown when saving?
        return DOMPurify.sanitize(content, {
            ALLOWED_TAGS: [],
        })
            .replace(/&nbsp;/g, ' ') // Replace &nbsp; with regular spaces
            .replace(/\n\s*\n/g, '\n\n') // Reduce multiple newlines to maximum two
            .trim(); // Remove leading and trailing whitespace
    };

    const handleSave = async () => {
        // const cleanContent = cleanEditorContent(editorContent);
        const newDoc = await saveTextDoc(
            kbId,
            editorContent,
            highlights,
            textDocId
        );

        setKbDocs((prevDocs) => {
            const existingDocs = prevDocs[kbId] || [];
            const updatedDocs = existingDocs.filter((doc) => doc.id !== newDoc.id);
            return {
                ...prevDocs,
                [kbId]: [...updatedDocs, newDoc],
            };
        });

        // Update localStorage
        const savedData = JSON.parse(localStorage.getItem('documents')) || {};
        savedData[kbId] = savedData[kbId] || [];
        const updatedDocs = savedData[kbId].filter((doc) => doc.id !== newDoc.id);
        savedData[kbId] = [...updatedDocs, newDoc];
        localStorage.setItem('documents', JSON.stringify(savedData));

        setTextDocId(newDoc.id);
        return newDoc.id;
    };

    const handleEmbed = async () => {
        let currentDocId = textDocId;
        const cleanContent = cleanEditorContent(editorContent);
        await embedTextDoc(currentDocId, kbId, cleanContent, highlights);
    };

    const setDocumentDetails = useCallback(
        (doc) => {
            setTextDocId(doc.id || null);
            setEditorContent(
                doc.content ? marked(doc.content.replace(/\n/g, '<br/>')) : ''
            );
            setHighlights(doc.highlights || []);
        },
        [setTextDocId, setEditorContent, setHighlights]
    );

    const removeDocumentDetails = () => {
        setTextDocId(null);
        setEditorContent('');
        setHighlights([]);
    };

    const embedTextDoc = async (docId, kbId, content, highlights) => {
        try {
            const response = await fetch(`${backendUrl}/kb/embed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify({
                    content,
                    highlights,
                    docId,
                    kbId,
                    source: 'user',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to embed text doc');
            }

            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Error embedding text doc:', error);
        }
    };

    const saveTextDoc = async (
        kbId,
        text,
        highlights = null,
        docId = null
    ) => {
        try {
            const response = await fetch(`${backendUrl}/kb/save_doc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify({
                    kbId,
                    text,
                    highlights,
                    docId,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save text doc');
            }

            const data = await response.json();
            return data.kb_doc;
        } catch (error) {
            console.error(error);
            showSnackbar('Error saving text doc', 'error');
        }
    };

    return {
        setDocumentDetails,
        removeDocumentDetails,
        textDocId,
        handleSave,
        handleEmbed,
    };
};
