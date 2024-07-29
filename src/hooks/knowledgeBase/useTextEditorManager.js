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
            if (doc.content) {
                setEditorContent(marked(doc.content.replace(/\n/g, '<br/>')));
            }

            if (doc.urls) {
                setEditorContent(
                    marked(
                        doc.urls[currentUrlIndex].content.replace(
                            /\n/g,
                            '<br/>'
                        )
                    )
                );
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
