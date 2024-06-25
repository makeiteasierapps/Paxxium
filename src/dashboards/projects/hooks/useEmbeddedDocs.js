import {useState, useCallback, useContext} from 'react';
import { AuthContext } from '../../../auth/AuthContext';
import { SnackbarContext } from '../../../SnackbarContext';

export const useEmbeddedDocs = (backendUrl) => {
    const { idToken } = useContext(AuthContext);
    const { showSnackbar } = useContext(SnackbarContext);

    const [embeddedDocs, setEmbeddedDocs] = useState({});
    
    const fetchEmbeddedDocs = useCallback(
        async (projectId) => {
            try {
                const response = await fetch(
                    `${backendUrl}/projects/documents`,
                    {
                        method: 'GET',
                        headers: {
                            Authorization: idToken,
                            'Project-ID': projectId,
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
        [backendUrl, idToken, showSnackbar]
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
                `${backendUrl}/projects/documents/delete`,
                {
                    method: 'DELETE',
                    headers: {
                        Authorization: idToken,
                        'Content-Type': 'application/json',
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
