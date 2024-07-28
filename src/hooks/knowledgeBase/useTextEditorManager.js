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
            if (doc.content) {
                setEditorContent(marked(doc.content.replace(/\n/g, '<br/>')));
            }

            if (doc.urls) {
                const stripProtocol = (url) =>
                    url.replace(/^(https?:\/\/)?(www\.)?/, '');
                const docSource = stripProtocol(doc.source);
                const matchingUrl = doc.urls.find(
                    (url) => stripProtocol(url.source) === docSource
                );
                if (matchingUrl) {
                    setEditorContent(
                        marked(matchingUrl.content.replace(/\n/g, '<br/>'))
                    );
                }
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
