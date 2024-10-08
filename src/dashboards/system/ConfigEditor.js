import React, { useEffect } from 'react';
import { useConfig } from '../hooks/useConfig';
import ConfigFileList from './ConfigFileList';
import ConfigFileEditor from './ConfigFileEditor';

const ConfigEditor = ({ uid }) => {
  const { fetchConfigFiles } = useConfig();

  useEffect(() => {
    fetchConfigFiles(uid);
  }, [fetchConfigFiles, uid]);

  return (
    <div className="config-editor">
      <ConfigFileList />
      <ConfigFileEditor uid={uid} />
    </div>
  );
};

export default ConfigEditor;