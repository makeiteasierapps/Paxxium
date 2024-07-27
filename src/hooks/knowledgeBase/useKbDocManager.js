import { useState, useCallback, useContext } from 'react';
import { SnackbarContext } from '../../contexts/SnackbarContext';
import { AuthContext } from '../../contexts/AuthContext';

export const useKbDocManager = (backendUrl) => {
    const { showSnackbar } = useContext(SnackbarContext);
    const { uid } = useContext(AuthContext);
    const [kbDocs, setKbDocs] = useState({});

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
    };
};
