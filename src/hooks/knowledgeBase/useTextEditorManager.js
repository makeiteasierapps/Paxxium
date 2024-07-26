import { useState, useContext, useCallback } from 'react';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { AuthContext } from '../../contexts/AuthContext';

export const useTextEditorManager = (
    selectedKb,
    documentText,
    setDocumentText,
    highlights,
    setHighlights,
    backendUrl,
    setEmbeddedDocs
) => {
    const [textDocId, setTextDocId] = useState(null);
    const { showSnackbar } = useContext(SnackbarContext);
    const { uid } = useContext(AuthContext);
    const kbId = selectedKb ? selectedKb.id : null;

    const handleSave = async () => {
        await saveTextDoc(kbId, documentText, highlights, textDocId);

        const newDoc = {
            content: documentText,
            highlights: highlights,
            id: textDocId,
            kb_id: kbId,
        };
        
        const savedData = JSON.parse(localStorage.getItem('documents')) || {};
        savedData[kbId] = [
            ...(savedData[kbId] || []).filter((doc) => doc.id !== textDocId),
            newDoc,
        ];

        setEmbeddedDocs((prevDocs) => ({
            ...prevDocs,
            [kbId]: savedData[kbId],
        }));

        localStorage.setItem('documents', JSON.stringify(savedData));

        return textDocId;
    };

    const handleEmbed = async () => {
        let currentDocId = textDocId;
        if (!currentDocId) {
            currentDocId = await handleSave();
        }
        await embedTextDoc(
            currentDocId,
            kbId,
            documentText,
            highlights,

        );
    };

    const addNewDoc = async () => {
        const docId = await saveTextDoc(kbId);
        const newTextDoc = {
            content: '',
            category: '',
            highlights: [],
            id: docId,
            source: 'user',
            kbId,
        };

        setEmbeddedDocs((prevDocs) => ({
            ...prevDocs,
            [kbId]: [...prevDocs[kbId], newTextDoc],
        }));

        const savedData = JSON.parse(localStorage.getItem('documents')) || {};
        const kbDocs = savedData[kbId] || [];
        kbDocs.push(newTextDoc);
        savedData[kbId] = [...kbDocs, newTextDoc];

        localStorage.setItem('documents', JSON.stringify(savedData));
        setDocumentDetails(newTextDoc);
    };

    const setDocumentDetails = useCallback((doc) => {
        console.log(doc)
        setTextDocId(doc.id || null);
        setDocumentText(doc.content || '');
        setHighlights(doc.highlights || []);
    }, [setTextDocId, setDocumentText, setHighlights]);

    const embedTextDoc = async (docId, kbId, doc, highlights, category) => {
        try {
            const response = await fetch(`${backendUrl}/kb/embed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify({
                    doc,
                    highlights,
                    docId,
                    kbId,
                    category,
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
        category = null,
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
                    category,
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
            return data.docId;
        } catch (error) {
            console.error(error);
            showSnackbar('Error saving text doc', 'error');
        }
    };

    return {
        addNewDoc,
        setDocumentDetails,
        textDocId,
        handleSave,
        handleEmbed,
    };
};
