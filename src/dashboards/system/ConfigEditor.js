import ConfigFileList from './ConfigFileList';
import ConfigFileEditor from './ConfigFileEditor';
import NewFileMenu from './NewFileMenu';
const ConfigEditor = ({ uid }) => {
    return (
        <div className="config-editor">
            <NewFileMenu />
            <ConfigFileList />
            <ConfigFileEditor uid={uid} />
        </div>
    );
};

export default ConfigEditor;
