import { useState, useContext } from 'react';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { AuthContext } from '../../contexts/AuthContext';

export const useDocumentData = (
    selectedKb,
    documentText,
    setDocumentText,
    highlights,
    setHighlights,
    backendUrl
) => {
    const [textDocArray, setTextDocArray] = useState([]);
    const [docId, setDocId] = useState(null);
    const [category, setCategory] = useState('');

    const { showSnackbar } = useContext(SnackbarContext);
    const { uid } = useContext(AuthContext);

    const kbId = selectedKb ? selectedKb.id : null;

    const handleSave = async () => {
        const savedData = JSON.parse(localStorage.getItem('textDocs')) || {};
        const kbDocs = savedData[kbId] || [];

        await saveTextDoc(kbId, category, documentText, highlights, docId);

        const newDoc = {
            content: documentText,
            category: category,
            highlights: highlights,
            id: docId,
            kbId,
        };

        const updatedKbDocs = kbDocs.filter((doc) => doc.id !== docId);
        updatedKbDocs.push(newDoc);
        setTextDocArray(updatedKbDocs);

        savedData[kbId] = updatedKbDocs;
        localStorage.setItem('textDocs', JSON.stringify(savedData));
        return docId;
    };

    const handleEmbed = async () => {
        let currentDocId = docId;
        if (!currentDocId) {
            currentDocId = await handleSave();
        }
        await embedTextDoc(
            currentDocId,
            kbId,
            documentText,
            highlights,
            category
        );
    };

    const addNewDoc = async () => {
        const docId = await saveTextDoc(kbId);
        const newTextDoc = {
            content: '',
            category: '',
            highlights: [],
            id: docId,
            kbId,
        };

        setTextDocArray([...textDocArray, newTextDoc]);

        const savedData = JSON.parse(localStorage.getItem('textDocs')) || {};
        const kbDocs = savedData[kbId] || [];
        kbDocs.push(newTextDoc);
        savedData[kbId] = kbDocs;

        localStorage.setItem('textDocs', JSON.stringify(savedData));
        setDocumentDetails(newTextDoc);
    };

    const fetchData = async () => {
        const savedData = JSON.parse(localStorage.getItem('textDocs')) || {};
        const kbDocs = savedData[kbId] || [];

        if (kbDocs.length > 0) {
            setTextDocArray(kbDocs);
        } else {
            const docs = await getTextDocs(kbId);
            savedData[kbId] = docs;
            setTextDocArray(docs);
            localStorage.setItem('textDocs', JSON.stringify(savedData));
        }
    };

    const setDocumentDetails = (doc) => {
        setDocId(doc.id || null);
        setDocumentText(doc.content || '');
        setHighlights(doc.highlights || []);
        setCategory(doc.category || '');
    };

    const getTextDocs = async () => {
        try {
            const response = await fetch(
                `${backendUrl}/kb/text_doc?kbId=${kbId}`,
                {
                    method: 'GET',
                    headers: {
                        dbName: process.env.REACT_APP_DB_NAME,
                        uid: uid,
                    },
                }
            );

            if (!response.ok) {
                throw new Error('Failed to get text doc');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error(error);
            showSnackbar('Error getting text doc', 'error');
        }
    };

    const embedTextDoc = async (docId, kbId, doc, highlights, category) => {
        try {
            const response = await fetch(`${backendUrl}/kb/embed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
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
            const response = await fetch(
                `${backendUrl}/kb/save_text_doc`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        dbName: process.env.REACT_APP_DB_NAME,
                    },
                    body: JSON.stringify({
                        kbId,
                        category,
                        text,
                        highlights,
                        docId,
                    }),
                }
            );

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
        textDocArray,
        addNewDoc,
        setDocumentDetails,
        docId,
        category,
        setCategory,
        handleSave,
        handleEmbed,
        fetchData,
    };
};
