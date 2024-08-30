import { useState, useCallback, useEffect } from 'react';

export const useKbManager = (backendUrl, uid, showSnackbar) => {
    const [kbArray, setKbArray] = useState([]);
    const [isNewKbOpen, setIsNewKbOpen] = useState(false);


    const addKnowledgeBase = (kb) => {
        setKbArray((prevKbArray) => {
            return [...prevKbArray, kb];
        });
    };

    const deleteKnowledgeBase = async (kbId) => {
        try {
            const response = await fetch(`${backendUrl}/kb`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    dbName: process.env.REACT_APP_DB_NAME,
                    uid: uid,
                },
                body: JSON.stringify({ kbId }),
            });

            if (!response.ok) {
                throw new Error('Failed to delete knowledge base');
            }

            setKbArray((prevKbArray) => {
                return prevKbArray.filter(
                    (kb) => kb.id !== kbId
                );
            });
        } catch (error) {
            showSnackbar('Error deleting knowledge base', 'error');
            throw error;
        }
    };

    const createKnowledgeBase = async (name, objective) => {
        const formData = JSON.stringify({ name, objective });
        try {
            const response = await fetch(
                `${backendUrl}/kb`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        uid: uid,
                        dbName: process.env.REACT_APP_DB_NAME,
                    },
                    body: formData,
                }
            );

            if (!response.ok) {
                throw new Error('Failed to create knowledge base');
            }
            const data = await response.json();
            const newKnowledgeBase = data.new_kb;
            addKnowledgeBase(newKnowledgeBase);
            setIsNewKbOpen(false);
        } catch (error) {
            showSnackbar('Error creating knowledge base', 'error');
            throw error;
        }
    };

    const fetchKBs = useCallback(async () => {
        try {
            const response = await fetch(`${backendUrl}/kb`, {
                method: 'GET',
                headers: {
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch knowledge base');
            }

            const data = await response.json();
            setKbArray(data);
        } catch (error) {
            showSnackbar('Error fetching knowledge base', 'error');
            throw error;
        }
    }, [backendUrl, showSnackbar, uid]);

    useEffect(() => {
        if (!uid) {
            return;
        }
        fetchKBs();
    }, [fetchKBs, uid]);

    return {
        kbArray,
        isNewKbOpen,
        setIsNewKbOpen,
        createKnowledgeBase,
        deleteKnowledgeBase,
    };
};
