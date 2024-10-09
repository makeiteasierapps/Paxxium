import ConfigFileList from './ConfigFileList';
import ConfigFileEditor from './ConfigFileEditor';

const ConfigEditor = ({ uid }) => {
    return (
        <div className="config-editor">
            <ConfigFileList />
            <ConfigFileEditor uid={uid} />
        </div>
    );
};

export default ConfigEditor;
