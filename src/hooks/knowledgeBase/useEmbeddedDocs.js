import { useState, useCallback, useContext } from 'react';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { AuthContext } from '../../contexts/AuthContext'

export const useEmbeddedDocs = (backendUrl) => {
    const { showSnackbar } = useContext(SnackbarContext);
    const { uid } = useContext(AuthContext);

    const [embeddedDocs, setEmbeddedDocs] = useState({});

    const fetchEmbeddedDocs = useCallback(
        async (kbId) => {
            try {
                const response = await fetch(
                    `${backendUrl}/kb/documents`,
                    {
                        method: 'GET',
                        headers: {
                            'Kb-ID': kbId,
                            'uid': uid,
                            'dbName': process.env.REACT_APP_DB_NAME,
                        },
                    }
                );

                if (!response.ok) {
                    throw new Error('Failed to fetch documents');
                }

                const data = await response.json();
                console.log(data);
                setEmbeddedDocs((prevDocuments) => ({
                    ...prevDocuments,
                    [kbId]: data.documents,
                }));
            } catch (error) {
                showSnackbar('Error fetching documents', 'error');
            }
        },
        [backendUrl, showSnackbar, uid]
    );

    const addEmbeddedDoc = (kbId, doc) => {
        setEmbeddedDocs((prevDocs) => {
            return {
                ...prevDocs,
                [kbId]: [...prevDocs[kbId], doc],
            };
        });
    };

    const deleteEmbeddedDoc = async (kbId, docId) => {
        try {
            const response = await fetch(
                `${backendUrl}/kb/documents`,
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
                const updatedKbDocs = prevDocs[kbId].filter(
                    (doc) => doc.id !== docId
                );
                return {
                    ...prevDocs,
                    [kbId]: updatedKbDocs,
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
