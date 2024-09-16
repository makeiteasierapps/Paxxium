import { useCallback } from 'react';
import { marked } from 'marked';

export const useTextEditorManager = (
    setEditorContent,
    setHighlights,
    setCurrentKbDoc
) => {
    const setDocumentDetails = useCallback(
        (doc, currentUrlIndex) => {
            setCurrentKbDoc(doc);

            if (Array.isArray(doc.content)) {
                setEditorContent(
                    marked(
                        doc.content[currentUrlIndex].content.replace(
                            /\n/g,
                            '<br/>'
                        )
                    )
                );
            } else if (typeof doc.content === 'string') {
                setEditorContent(marked(doc.content.replace(/\n/g, '<br/>')));
            }

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
