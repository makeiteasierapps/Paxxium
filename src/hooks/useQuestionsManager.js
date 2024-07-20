import { useCallback, useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { SnackbarContext } from '../contexts/SnackbarContext';

export const useQuestionsManager = (backendUrl) => {
    const [treeData, setTreeData] = useState({
        name: 'Root',
        children: [],
        parent: null,
    });
    const [newCategory, setNewCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const { uid } = useContext(AuthContext);
    const { showSnackbar } = useContext(SnackbarContext);

    const addCategoryToTree = useCallback((root, newCategory) => {
        const newRoot = { ...root };
        if (Array.isArray(newCategory)) {
            newCategory.forEach((category) => {
                addCategoryToTree(newRoot, category);
            });
            return newRoot;
        }
        const categoryNode = {
            name: newCategory.category,
            children: [],
            parent: newRoot,
        };

        newCategory.questions.forEach((questionAnswerPair) => {
            const questionNode = {
                id: questionAnswerPair._id,
                name: questionAnswerPair.question,
                answer: questionAnswerPair.answer || '',
                children: [],
                parent: categoryNode,
            };
            categoryNode.children.push(questionNode);
        });

        newRoot.children.push(categoryNode);

        return newRoot; 
    }, []);

    useEffect(() => {
        if (newCategory) {
            setTreeData((prevTreeData) =>
                addCategoryToTree(prevTreeData, newCategory)
            );
        }
    }, [addCategoryToTree, newCategory]);

    const updateAnswer = async (questionId, answer) => {
        try {
            const response = await fetch(`${backendUrl}/profile/answers`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
                body: JSON.stringify({ questionId, answer }),
            });

            if (!response.ok) {
                throw new Error('Failed to update answers');
            }
            const updateNodeAnswer = (node) => {
                if (node.id === questionId) {
                    node.answer = answer; // Update the answer
                }
                node.children.forEach(updateNodeAnswer); // Recursively update children
            };

            treeData.children.forEach(updateNodeAnswer);
        } catch (error) {
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            console.log(error);
        }
    };

    const analyzeAnsweredQuestions = async () => {
        try {
            const response = await fetch(`${backendUrl}/profile/analyze`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to analyze profile');
            }

            const data = await response.json();
            const cachedProfileData = localStorage.getItem('profileData');
            if (cachedProfileData) {
                const profileData = JSON.parse(cachedProfileData);
                profileData.analysis = data.analysis;
                localStorage.setItem(
                    'profileData',
                    JSON.stringify(profileData)
                ); // Save back to local storage
            }
        } catch (error) {
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            console.error(error);
        }
    };

    const generateBaseQuestions = async (userInput) => {
        setIsLoading(true);
        try {
            const response = await fetch(
                `${backendUrl}/profile/generate_questions`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        uid: uid,
                        dbName: process.env.REACT_APP_DB_NAME,
                    },
                    body: JSON.stringify({ userInput }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to generate follow-up questions');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.trim()) {
                        const result = JSON.parse(line);
                        console.log('Received question:', result);
                        setNewCategory(result);
                    }
                }
            }
        } catch (error) {
            console.error('Error generating follow-up questions:', error);
            showSnackbar(
                `Error generating follow-up questions: ${error.message}`,
                'error'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const getQuestions = useCallback(async () => {
        try {
            const response = await fetch(`${backendUrl}/profile/questions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
            });
            const data = await response.json();
            setTreeData((prevTreeData) =>
                addCategoryToTree(prevTreeData, data)
            );
            console.log('data', data);
        } catch (error) {
            showSnackbar(`Network or fetch error: ${error.message}`, 'error');
            console.error(error);
        }
    }, [addCategoryToTree, backendUrl, showSnackbar, uid]);

    useEffect(() => {
        if (!uid) {
            return;
        }
        getQuestions();
    }, [getQuestions, uid]);

    return {
        updateAnswer,
        analyzeAnsweredQuestions,
        generateBaseQuestions,
        isLoading,
        treeData,
    };
};
