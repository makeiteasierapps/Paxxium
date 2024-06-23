import { useState, useContext } from 'react';
import { SnackbarContext } from '../../../SnackbarContext';
import { AuthContext } from '../../../auth/AuthContext';

export const useDocumentData = () => {
    const [documentText, setDocumentText] = useState('');
    const [highlights, setHighlights] = useState([]);
    const [docId, setDocId] = useState(null);
    const [category, setCategory] = useState('');

    const { idToken } = useContext(AuthContext);
    const { showSnackbar } = useContext(SnackbarContext);

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? 'http://localhost:50006'
            : process.env.REACT_APP_BACKEND_URL_PROD;

    const handleSave = async (project) => {
        const savedData = JSON.parse(localStorage.getItem('textDocs')) || {};
        const existingDoc = savedData[project.id];
        const existingDocId = existingDoc ? existingDoc.docId : null;

        const docId = await saveTextDoc(
            project.id,
            category,
            documentText,
            highlights,
            existingDocId
        );

        savedData[project.id] = {
            content: documentText,
            category: category,
            highlights: highlights,
            docId: docId,
        };
        setDocId(docId);
        localStorage.setItem('textDocs', JSON.stringify(savedData));
        return docId;
    };

    const handleEmbed = async (project) => {
        let currentDocId = docId;
        if (!currentDocId) {
            currentDocId = await handleSave();
        }
        await embedTextDoc(
            currentDocId,
            project.id,
            documentText,
            highlights,
            category
        );
    };

    

    const fetchData = async (project) => {
        const savedData = JSON.parse(localStorage.getItem('textDocs')) || {};
        console.log(savedData);
        if (savedData[project.id]) {
            setDocumentText(savedData[project.id].content || '');
            setHighlights(savedData[project.id].highlights || []);
            setDocId(savedData[project.id].docId || null);
            setCategory(savedData[project.id].category || '');
        } else {
            const doc = await getTextDoc(project.id);
            setDocId(doc.id || null);
            setDocumentText(doc.content || '');
            setHighlights(doc.highlights || []);
            setCategory(doc.category || '');

            const newTextDocs = {
                [project.id]: {
                    content: doc.content || '',
                    highlights: doc.highlights || [],
                    category: doc.category || '',
                    docId: doc.id || null,
                },
            };
            localStorage.setItem('textDocs', JSON.stringify(newTextDocs));
        }
    };

    const getTextDoc = async (projectId) => {
        try {
            const response = await fetch(
                `${backendUrl}/projects/text_doc?projectId=${projectId}`,
                {
                    method: 'GET',
                    headers: {
                        Authorization: idToken,
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

    const embedTextDoc = async (
        docId,
        projectId,
        doc,
        highlights,
        category
    ) => {
        const response = await fetch(`${backendUrl}/projects/embed`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: idToken,
            },
            body: JSON.stringify({
                doc: doc,
                highlights: highlights,
                docId: docId,
                projectId: projectId,
                category: category,
            }),
        });
        const data = await response.json();
        console.log(data);
    };

    const saveTextDoc = async (
        projectId,
        category,
        text,
        highlights,
        docId
    ) => {
        try {
            const response = await fetch(
                `${backendUrl}/projects/save_text_doc`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: idToken,
                    },
                    body: JSON.stringify({
                        projectId,
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
        documentText,
        highlights,
        setHighlights,
        docId,
        category,
        handleSave,
        handleEmbed,
        fetchData,
    };
};
