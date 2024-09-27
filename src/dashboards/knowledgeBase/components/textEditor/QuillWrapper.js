import React, { forwardRef, useImperativeHandle, useRef } from 'react';
import ReactQuill from 'react-quill';
import { styled } from '@mui/material/styles';

const StyledReactQuill = styled(ReactQuill)(({ muiTheme }) => ({
    flex: 1,
    minHeight: '50%',
    border: 'none',
    '& .ql-container': {
        height: 'auto',
        minHeight: '300px',
        maxHeight: 'calc(90vh - 200px)',
        overflowY: 'auto',
        border: 'none',
    },
}));

export const QuillWrapper = forwardRef((props, ref) => {
    const quillRef = useRef(null);

    // useImperativeHandle allows us to customize the instance value that is exposed to parent components when they use a ref
    useImperativeHandle(ref, () => ({
        getEditor: () => quillRef.current?.getEditor(),
    }));

    return <StyledReactQuill ref={quillRef} {...props} />;
});

// The root cause: The ReactQuill component internally uses findDOMNode, which is now deprecated in React. This method was typically used to get a reference to the DOM node of a component, but it has issues with React's concurrent rendering features.
// Why we need a wrapper: We can't directly modify the ReactQuill library to remove the findDOMNode usage. Instead, we create a wrapper component that uses React's newer, safer ref forwarding mechanism.
// Using forwardRef: This allows our wrapper component to receive a ref from its parent and pass it down to the child component (in this case, ReactQuill).
// Local useRef: We create a local ref (quillRef) that we attach directly to the ReactQuill component. This gives us a safe way to access the ReactQuill instance.
// useImperativeHandle: This hook allows us to define what gets exposed when a parent component uses a ref on our QuillWrapper. We use it to expose a getEditor method that safely accesses the Quill editor instance.
// Safe editor access: The getEditor method uses optional chaining (?.) to safely access the editor, preventing errors if the ref isn't set yet.
// 7. Prop forwarding: We use the spread operator ({...props}) to pass all received props to the ReactQuill component, ensuring we don't lose any functionality.
// This solution effectively creates a layer between the parent component and ReactQuill that doesn't rely on findDOMNode. Instead, it uses React's recommended ref forwarding pattern, which is compatible with concurrent rendering and doesn't trigger the deprecation warning.
// By using this wrapper, we maintain all the functionality of ReactQuill while adhering to React's best practices for accessing component instances and DOM nodes. This approach resolves the deprecation warning without requiring changes to the ReactQuill library itself.