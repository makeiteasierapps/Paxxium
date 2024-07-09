import { useState, useContext } from 'react';
import { SnackbarContext } from '../../../SnackbarContext';
import { AuthContext } from '../../../auth/AuthContext';

export const useDocumentData = (
    selectedProject,
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

    const projectId = selectedProject ? selectedProject.id : null;

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

    const addNewDoc = async () => {
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

    const fetchData = async () => {
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

    const getTextDocs = async () => {
        try {
            const response = await fetch(
                `${backendUrl}/projects/text_doc?projectId=${projectId}`,
                {
                    method: 'GET',
                    headers: {
                        'dbName': process.env.REACT_APP_DB_NAME,
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
                'dbName': process.env.REACT_APP_DB_NAME,
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
        try {
            const response = await fetch(
                `${backendUrl}/projects/save_text_doc`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'dbName': process.env.REACT_APP_DB_NAME,
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
