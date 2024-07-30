import { useReducer, useCallback, useEffect } from 'react';

const initialState = {
    nodes: [],
    isLoading: true,
    error: null,
};

function graphReducer(state, action) {
    switch (action.type) {
        case 'SET_NODES':
            return { ...state, nodes: action.payload, isLoading: false };
        case 'SET_ERROR':
            return { ...state, error: action.payload, isLoading: false };
        case 'UPDATE_NODE':
            return {
                ...state,
                nodes: state.nodes.map((node) =>
                    node.id === action.payload.id
                        ? { ...node, ...action.payload.updates }
                        : node
                ),
            };
        default:
            return state;
    }
}

export function useGraphManager(backendUrl, uid) {
    const [state, dispatch] = useReducer(graphReducer, initialState);

    const addCategoryToTree = useCallback((root, newCategory) => {
        if (Array.isArray(newCategory)) {
            newCategory.forEach((category) => {
                addCategoryToTree(root, category);
            });
            return root;
        }

        const categoryNode = {
            id: `category-${Date.now()}-${Math.random()}`,
            parentId: root.id,
            type: 'category',
            name: newCategory.category,
            children: [],
        };

        root.children.push(categoryNode);

        newCategory.questions.forEach((questionAnswerPair) => {
            const questionNode = {
                id: questionAnswerPair._id,
                parentId: categoryNode.id,
                type: 'question',
                name: questionAnswerPair.question,
                children: [],
            };

            const answerNode = {
                id: `answer-${questionAnswerPair._id}`,
                parentId: questionNode.id,
                type: 'answer',
                name: questionAnswerPair.answer || '',
            };

            categoryNode.children.push(questionNode);
            questionNode.children = [answerNode];
        });
        return root;
    }, []);

    // Helper function to flatten the tree structure
    const flattenTree = useCallback((node, nodes = []) => {
        nodes.push(node);
        if (node.children) {
            node.children.forEach((child) => flattenTree(child, nodes));
            delete node.children;
        }
        return nodes;
    }, []);

    const fetchQuestions = useCallback(async () => {
        try {
            const cachedQuestions = localStorage.getItem('questionsData');
            if (cachedQuestions) {
                const data = JSON.parse(cachedQuestions);
                const rootNode = {
                    id: 'root',
                    type: 'root',
                    name: 'Personalized Questions',
                    children: [],
                };
                const treeData = addCategoryToTree(rootNode, data);
                dispatch({ type: 'SET_NODES', payload: flattenTree(treeData) });
                return;
            }

            const response = await fetch(`${backendUrl}/profile/questions`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    uid: uid,
                    dbName: process.env.REACT_APP_DB_NAME,
                },
            });

            const data = await response.json();
            const rootNode = {
                id: 'root',
                type: 'root',
                name: 'Personalized Questions',
                children: [],
            };
            const treeData = addCategoryToTree(rootNode, data);
            dispatch({ type: 'SET_NODES', payload: flattenTree(treeData) });

            localStorage.setItem('questionsData', JSON.stringify(data));
        } catch (error) {
            console.error(error);
            dispatch({ type: 'SET_ERROR', payload: error.message });
        }
    }, [addCategoryToTree, backendUrl, flattenTree, uid]);

    useEffect(() => {
        if (!uid) return;
        fetchQuestions();
    }, [fetchQuestions, uid]);

    const updateNode = useCallback((id, updates) => {
        dispatch({ type: 'UPDATE_NODE', payload: { id, updates } });
    }, []);

    return {
        nodes: state.nodes,
        isLoading: state.isLoading,
        error: state.error,
        updateNode,
        fetchQuestions,
    };
}
