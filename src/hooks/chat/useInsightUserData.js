import { useEffect } from "react";

export const useInsightUserData = ({ uid, showSnackbar, socket }) => {
    const handleUpdatedUserData = (data) => {
        console.log(data);
    };

    useEffect(() => {
        if (!socket) return;

        socket.on('insight_user_data', handleUpdatedUserData);

        return () => {
            socket.off('insight_user_data', handleUpdatedUserData);
        };
    }, [socket]);
};