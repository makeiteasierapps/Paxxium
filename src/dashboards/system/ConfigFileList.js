import React from 'react';
import { useConfig } from '../../hooks/useConfigManager';

const ConfigFileList = () => {
    const { configFiles, selectedFile, setSelectedFile } = useConfig();

    return (
        <div className="config-file-list">
            <h3>Config Files</h3>
            <ul>
                {configFiles.map((file) => (
                    <li
                        key={file.filename}
                        className={
                            file.filename === selectedFile ? 'selected' : ''
                        }
                        onClick={() => setSelectedFile(file)}
                    >
                        {file.filename}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ConfigFileList;
