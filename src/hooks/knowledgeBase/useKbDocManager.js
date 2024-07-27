import { useState, useCallback, useContext } from 'react';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { AuthContext } from '../../contexts/AuthContext';
import DOMPurify from 'dompurify';

export const useKbDocManager = (
    backendUrl,
    selectedKb,
    editorContent,
    highlights
) => {
    const { showSnackbar } = useContext(SnackbarContext);
    const { uid } = useContext(AuthContext);
    const [kbDocs, setKbDocs] = useState({});
    const [currentKbDoc, setCurrentKbDoc] = useState({});
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

    const updateDocumentState = (newDoc) => {
        setKbDocs((prevDocs) => {
            const existingDocs = prevDocs[kbId] || [];
            const updatedDocs = existingDocs.filter(
                (doc) => doc.id !== newDoc.id
            );
            return {
                ...prevDocs,
                [kbId]: [...updatedDocs, newDoc],
            };
        });

        // Update localStorage
        const savedData = JSON.parse(localStorage.getItem('documents')) || {};
        savedData[kbId] = savedData[kbId] || [];
        const updatedDocs = savedData[kbId].filter(
            (doc) => doc.id !== newDoc.id
        );
        savedData[kbId] = [...updatedDocs, newDoc];
        localStorage.setItem('documents', JSON.stringify(savedData));

        setCurrentKbDoc(newDoc);
    };

    const handleSave = async () => {
        const newDoc = await saveKbDoc({
            ...currentKbDoc,
            kbId,
            content: editorContent,
            highlights,
        });

        updateDocumentState(newDoc);
        return newDoc.id;
    };

    const handleEmbed = async () => {
        const cleanContent = cleanEditorContent(editorContent);
        let embeddedDoc = await embedKbDoc({
            ...currentKbDoc,
            kbId,
            content: cleanContent,
            highlights,
        });
        embeddedDoc.content = editorContent;
        console.log('embeddedDoc', embeddedDoc);
        if (embeddedDoc) {
            updateDocumentState(embeddedDoc);
        }
    };

    const embedKbDoc = async (docData) => {
        try {
            const response = await fetch(`${backendUrl}/kb/embed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify(docData),
            });

            if (!response.ok) {
                throw new Error('Failed to embed text doc');
            }

            const data = await response.json();
            console.log(data.kb_doc);
            return data.kb_doc;
        } catch (error) {
            console.error('Error embedding text doc:', error);
            showSnackbar('Error embedding text doc', 'error');
            return null;
        }
    };

    const saveKbDoc = async (docData) => {
        try {
            const response = await fetch(`${backendUrl}/kb/save_doc`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify(docData),
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

    const fetchKbDocs = useCallback(
        async (kbId) => {
            try {
                const response = await fetch(`${backendUrl}/kb/documents`, {
                    method: 'GET',
                    headers: {
                        'Kb-ID': kbId,
                        uid: uid,
                        dbName: process.env.REACT_APP_DB_NAME,
                    },
                });

                if (!response.ok) {
                    throw new Error('Failed to fetch documents');
                }

                const data = await response.json();
                setKbDocs((prevDocuments) => ({
                    ...prevDocuments,
                    [kbId]: data.documents,
                }));
            } catch (error) {
                showSnackbar('Error fetching documents', 'error');
            }
        },
        [backendUrl, showSnackbar, uid]
    );

    const deleteKbDoc = async (kbId, docId) => {
        try {
            const response = await fetch(`${backendUrl}/kb/documents`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify({ docId }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete document');
            }

            setKbDocs((prevDocs) => {
                const updatedKbDocs = prevDocs[kbId].filter(
                    (doc) => doc.id !== docId
                );
                return {
                    ...prevDocs,
                    [kbId]: updatedKbDocs,
                };
            });

            const savedData =
                JSON.parse(localStorage.getItem('documents')) || {};
            const updatedKbDocs =
                savedData[kbId]?.filter((doc) => doc.id !== docId) || [];
            localStorage.setItem(
                'documents',
                JSON.stringify({ ...savedData, [kbId]: updatedKbDocs })
            );
        } catch (error) {
            showSnackbar('Error deleting document', 'error');
        }
    };

    return {
        kbDocs,
        setKbDocs,
        fetchKbDocs,
        deleteKbDoc,
        handleSave,
        handleEmbed,
        currentKbDoc,
        setCurrentKbDoc,
    };
};
