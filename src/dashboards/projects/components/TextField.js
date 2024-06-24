import { useEffect, useContext } from 'react';
import { Box } from '@mui/material';
import TextInputUtilityBar from './TextInputUtilityBar';
import { ProjectContext } from '../ProjectContext';
import { styled } from '@mui/system';

const MainBox = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '70vh',
    border: '1px solid #e0e0e0',
});

const TextFieldComponent = ({ project }) => {
    const {
        documentManager: { fetchData },
        highlightsManager: { contentEditableRef, handleInput, handleMouseUp },
    } = useContext(ProjectContext);

    useEffect(() => {
        fetchData(project);
    }, []);

    return (
        <MainBox>
            <TextInputUtilityBar project={project} />
            <div
                ref={contentEditableRef}
                contentEditable
                onInput={handleInput}
                onMouseUp={handleMouseUp}
                style={{
                    whiteSpace: 'pre-wrap',
                    padding: '10px 20px',
                    border: '1px solid #e0e0e0',
                    height: '100%',
                    overflowY: 'auto',
                    marginTop: '10px',
                }}
            />
        </MainBox>
    );
};

export default TextFieldComponent;
