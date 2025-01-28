import { useContext } from 'react';
import ConfigFileMenu from './ConfigFileMenu';
import ConfigFileEditor from './ConfigFileEditor';
import { AuthContext } from '../../contexts/AuthContext';
import { MainContainer } from '../../dashboards/styledComponents/DashStyledComponents';

const ProjectManager = () => {
    const { uid } = useContext(AuthContext);

    return (
        <MainContainer sx={{ maxWidth: '1200px' }}>
            <ConfigFileMenu />
            <ConfigFileEditor uid={uid} />
        </MainContainer>
    );
};

export default ProjectManager;
