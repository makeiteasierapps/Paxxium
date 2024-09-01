import { useContext } from 'react';
import { SettingsContext } from '../../../contexts/SettingsContext';
import {
    StyledRootNode,
    StyledShadowWrapper,
} from '../styledProfileComponents';
const RootNode = ({ node, onClick }) => {
    const { avatar } = useContext(SettingsContext);
    return (
        <StyledShadowWrapper>
            <StyledRootNode
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClick}
                sx={{
                    backgroundImage: `url(${avatar})`,
                }}
            />
        </StyledShadowWrapper>
    );
};

export default RootNode;
