import { useCallback, useState, useEffect } from 'react';
import { marked } from 'marked';

export const useTextEditorManager = (document) => {
    const [editorContent, setEditorContent] = useState('');
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [currentDocIndex, setCurrentDocIndex] = useState(0);

    useEffect(() => {
        if (document && Array.isArray(document.content)) {
            setCurrentDocIndex(document.content.length - 1);
        }
    }, [document]);

    const handlePrevUrl = () => {
        setCurrentDocIndex((prevIndex) =>
            prevIndex < document.content.length - 1 ? prevIndex + 1 : 0
        );
    };

    const handleNextUrl = () => {
        setCurrentDocIndex((prevIndex) =>
            prevIndex > 0 ? prevIndex - 1 : document.content.length - 1
        );
    };

    const toggleEditor = () => {
        setIsEditorOpen((prev) => !prev);
    };

    const setDocumentDetails = useCallback((doc, index) => {
        if (doc.content && Array.isArray(doc.content)) {
            setEditorContent(
                marked(doc.content[index].content.replace(/\n/g, '<br/>'))
            );
        } else if (typeof doc.content === 'string') {
            setEditorContent(marked(doc.content.replace(/\n/g, '<br/>')));
        }
    }, []);

    const removeDocumentDetails = () => {
        setEditorContent('');
    };

    return {
        setDocumentDetails,
        removeDocumentDetails,
        isEditorOpen,
        toggleEditor,
        handlePrevUrl,
        handleNextUrl,
        currentDocIndex,
        editorContent,
        setEditorContent,
        setCurrentDocIndex,
    };
};
