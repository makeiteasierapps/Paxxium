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
    setEmbeddedDocs
) => {
    const [textDocId, setTextDocId] = useState(null);
    const { showSnackbar } = useContext(SnackbarContext);
    const { uid } = useContext(AuthContext);
    const kbId = selectedKb ? selectedKb.id : null;

    const cleanEditorContent = (content) => {
        return DOMPurify.sanitize(content, {
            ALLOWED_TAGS: [],
        })
            .replace(/&nbsp;/g, ' ') // Replace &nbsp; with regular spaces
            .replace(/\n\s*\n/g, '\n\n') // Reduce multiple newlines to maximum two
            .trim(); // Remove leading and trailing whitespace
    };

    const handleSave = async () => {
        const cleanContent = cleanEditorContent(editorContent);
        const docId = await saveTextDoc(
            kbId,
            cleanContent,
            highlights,
            textDocId
        );

        const newDoc = {
            content: cleanContent,
            highlights: highlights,
            id: docId,
            kb_id: kbId,
            source: 'user',
        };

        setEmbeddedDocs((prevDocs) => {
            const existingDocs = prevDocs[kbId] || [];
            const updatedDocs = existingDocs.filter((doc) => doc.id !== docId);
            return {
                ...prevDocs,
                [kbId]: [...updatedDocs, newDoc],
            };
        });

        // Update localStorage
        const savedData = JSON.parse(localStorage.getItem('documents')) || {};
        savedData[kbId] = savedData[kbId] || [];
        const updatedDocs = savedData[kbId].filter((doc) => doc.id !== docId);
        savedData[kbId] = [...updatedDocs, newDoc];
        localStorage.setItem('documents', JSON.stringify(savedData));

        setTextDocId(docId);
        return docId;
    };

    const handleEmbed = async () => {
        //makes sure the document is saved before embedding
        let currentDocId = textDocId;
        if (!currentDocId) {
            currentDocId = await handleSave();
        }

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
        text = null,
        highlights = null,
        docId = null
    ) => {
        try {
            const response = await fetch(`${backendUrl}/kb/save_text_doc`, {
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
                    source: 'user',
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to save text doc');
            }

            const data = await response.json();
            console.log(data);
            return data.docId;
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
