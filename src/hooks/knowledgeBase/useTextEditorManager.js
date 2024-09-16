import { useCallback } from 'react';
import { marked } from 'marked';

export const useTextEditorManager = (
    setEditorContent,
    setCurrentKbDoc
) => {
    const setDocumentDetails = useCallback(
        (doc, currentUrlIndex) => {
            setCurrentKbDoc(doc);
            if (doc.content && Array.isArray(doc.content)) {
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

        },
        [setCurrentKbDoc, setEditorContent]
    );

    const removeDocumentDetails = () => {
        setCurrentKbDoc({});
        setEditorContent('');
    };

    return {
        setDocumentDetails,
        removeDocumentDetails,
    };
};
