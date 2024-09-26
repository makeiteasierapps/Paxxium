import { useCallback, useState, useEffect } from 'react';
import { marked } from 'marked';
import TurndownService from 'turndown';

const turndownService = new TurndownService();
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

    const convertHTMLtoMarkdown = (content) => {
        content = content.trim();
        let markdown = turndownService.turndown(content);

        markdown = markdown
            .replace(/\\{2,}n/g, '\n') // Replace double (or more) backslashes followed by 'n' with a single newline
            .replace(/\\\n/g, '\n') // Remove single backslashes before newlines
            .replace(/\n{3,}/g, '\n\n') // Replace 3 or more consecutive newlines with 2
            .replace(/\\_/g, '_') // Remove backslashes before underscores
            .replace(/\\\*/g, '*') // Remove backslashes before asterisks
            .replace(/\\=/g, '=') // Remove backslashes before equal signs
            .replace(/\s+$/gm, '') // Remove trailing spaces from each line
            .trim(); // Trim any leading/trailing whitespace

        return markdown;
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
        convertHTMLtoMarkdown,
    };
};
