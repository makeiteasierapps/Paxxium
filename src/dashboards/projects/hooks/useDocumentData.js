import { useState, useContext } from 'react';
import { SnackbarContext } from '../../../SnackbarContext';
import { AuthContext } from '../../../auth/AuthContext';

export const useDocumentData = (selectedProject) => {
    const [documentText, setDocumentText] = useState('');
    const [textDocArray, setTextDocArray] = useState([]);
    const [highlights, setHighlights] = useState([]);
    const [docId, setDocId] = useState(null);
    const [category, setCategory] = useState('');

    const { idToken } = useContext(AuthContext);
    const { showSnackbar } = useContext(SnackbarContext);

    const projectId = selectedProject ? selectedProject.id : null;

    const backendUrl =
        process.env.NODE_ENV === 'development'
            ? 'http://localhost:50006'
            : process.env.REACT_APP_BACKEND_URL_PROD;

    const handleSave = async () => {
        const savedData = JSON.parse(localStorage.getItem('textDocs')) || {};
        const projectDocs = savedData[projectId] || [];

        await saveTextDoc(projectId, category, documentText, highlights, docId);

        const newDoc = {
            content: documentText,
            category: category,
            highlights: highlights,
            id: docId,
            projectId: projectId,
        };

        const updatedProjectDocs = projectDocs.filter(
            (doc) => doc.id !== docId
        );
        updatedProjectDocs.push(newDoc);
        setTextDocArray(updatedProjectDocs);

        savedData[projectId] = updatedProjectDocs;
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
            projectId,
            documentText,
            highlights,
            category
        );
    };

    const addNewDoc = async (projectId) => {
        const docId = await saveTextDoc(projectId);
        const newTextDoc = {
            content: '',
            category: '',
            highlights: [],
            id: docId,
            projectId: projectId,
        };

        setTextDocArray([...textDocArray, newTextDoc]);

        const savedData = JSON.parse(localStorage.getItem('textDocs')) || {};
        const projectDocs = savedData[projectId] || [];
        projectDocs.push(newTextDoc);
        savedData[projectId] = projectDocs;

        localStorage.setItem('textDocs', JSON.stringify(savedData));
        setDocumentDetails(newTextDoc);
    };

    const fetchData = async (projectId) => {
        const savedData = JSON.parse(localStorage.getItem('textDocs')) || {};
        const projectDocs = savedData[projectId] || [];

        if (projectDocs.length > 0) {
            setTextDocArray(projectDocs);
        } else {
            const docs = await getTextDocs(projectId);
            savedData[projectId] = docs;
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

    const getTextDocs = async (projectId) => {
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
        category = null,
        text = null,
        highlights = null,
        docId = null
    ) => {
        console.log(docId);
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
        textDocArray,
        documentText,
        setDocumentText,
        addNewDoc,
        setDocumentDetails,
        highlights,
        setHighlights,
        docId,
        category,
        setCategory,
        handleSave,
        handleEmbed,
        fetchData,
    };
};
