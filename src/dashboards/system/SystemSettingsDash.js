import { useContext, useEffect } from "react";
import ConfigFileMenu from "./ConfigFileMenu";
import ConfigFileEditor from "./ConfigFileEditor";
import { AuthContext } from "../../contexts/AuthContext";
import { SystemContext } from "../../contexts/SystemContext";
import { MainContainer } from "../../dashboards/styledComponents/DashStyledComponents";
import ContextResearch from "./ContextResearch";
const SystemSettingsDash = () => {
  const {
    fetchConfigFiles,
    systemAgentMessages,
    messageSystemAgent,
    checkSystemHealth,
  } = useContext(SystemContext);
  const { uid } = useContext(AuthContext);

  useEffect(() => {
    fetchConfigFiles(uid);
    checkSystemHealth();
    const healthCheckInterval = setInterval(() => {
      checkSystemHealth();
    }, 30000);
    return () => clearInterval(healthCheckInterval);
  }, [uid, fetchConfigFiles, checkSystemHealth]);

  if (!uid) {
    return null;
  }

  return (
    <MainContainer>
      <ConfigFileMenu />
      <ConfigFileEditor uid={uid} />

      <ContextResearch />
      {/* <Chat
                    sx={{
                        width: '100%',
                        height: '90vh',
                    }}
                    messages={systemAgentMessages}
                    onSendMessage={messageSystemAgent}
                /> */}
    </MainContainer>
  );
};

export default SystemSettingsDash;
