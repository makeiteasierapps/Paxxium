import React from 'react';
import { useConfig } from '../hooks/useConfig';

const ConfigFileList = () => {
  const { configFiles, selectedFile, setSelectedFile } = useConfig();

  return (
    <div className="config-file-list">
      <h3>Config Files</h3>
      <ul>
        {configFiles.map((file) => (
          <li
            key={file}
            className={file === selectedFile ? 'selected' : ''}
            onClick={() => setSelectedFile(file)}
          >
            {file}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConfigFileList;