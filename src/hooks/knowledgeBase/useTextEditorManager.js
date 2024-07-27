import { useCallback } from 'react';
import { marked } from 'marked';

export const useTextEditorManager = (
    setEditorContent,
    setHighlights,
    setCurrentKbDoc
) => {
    const setDocumentDetails = useCallback(
        (doc) => {
            setCurrentKbDoc(doc);
            setEditorContent(
                doc.content ? marked(doc.content.replace(/\n/g, '<br/>')) : ''
            );
            setHighlights(doc.highlights || []);
        },
        [setCurrentKbDoc, setEditorContent, setHighlights]
    );

    const removeDocumentDetails = () => {
        setCurrentKbDoc({});
        setEditorContent('');
        setHighlights([]);
    };

    return {
        setDocumentDetails,
        removeDocumentDetails,
    };
};
