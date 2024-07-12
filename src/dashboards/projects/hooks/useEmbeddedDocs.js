import { useState, useCallback, useContext } from 'react';
import { SnackbarContext } from '../../../SnackbarContext';
import { AuthContext } from '../../../auth/AuthContext'

export const useEmbeddedDocs = (backendUrl) => {
    const { showSnackbar } = useContext(SnackbarContext);
    const { uid } = useContext(AuthContext);

    const [embeddedDocs, setEmbeddedDocs] = useState({});

    const fetchEmbeddedDocs = useCallback(
        async (projectId) => {
            try {
                const response = await fetch(
                    `${backendUrl}/projects/documents`,
                    {
                        method: 'GET',
                        headers: {
                            'Project-ID': projectId,
                            'uid': uid,
                            'dbName': process.env.REACT_APP_DB_NAME,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch documents');
                }

                const data = await response.json();
                setEmbeddedDocs((prevDocuments) => ({
                    ...prevDocuments,
                    [projectId]: data.documents,
                }));
            } catch (error) {
                showSnackbar('Error fetching documents', 'error');
            }
        },
        [backendUrl, showSnackbar, uid]
    );

    const addEmbeddedDoc = (projectId, doc) => {
        setEmbeddedDocs((prevDocs) => {
            return {
                ...prevDocs,
                [projectId]: [...prevDocs[projectId], doc],
            };
        });
    };

    const deleteEmbeddedDoc = async (projectId, docId) => {
        try {
            const response = await fetch(
                `${backendUrl}/projects/documents`,
                {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'uid': uid,
                        'dbName': process.env.REACT_APP_DB_NAME,
                    },
                    body: JSON.stringify({ docId }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete document');
            }

            setEmbeddedDocs((prevDocs) => {
                const updatedProjectDocs = prevDocs[projectId].filter(
                    (doc) => doc.id !== docId
                );
                return {
                    ...prevDocs,
                    [projectId]: updatedProjectDocs,
                };
            });
        } catch (error) {
            showSnackbar('Error deleting document', 'error');
        }
    };

    return {
        embeddedDocs,
        fetchEmbeddedDocs,
        addEmbeddedDoc,
        deleteEmbeddedDoc,
    };
};
