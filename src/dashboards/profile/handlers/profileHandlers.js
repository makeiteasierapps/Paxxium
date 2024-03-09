const backendUrl =
    process.env.NODE_ENV === 'development'
        ? process.env.REACT_APP_PROFILE_URL
        : process.env.REACT_APP_BACKEND_URL_PROD;

export const handleUserUpdate = async (idToken, profileData) => {
    try {
        await fetch(`${backendUrl}/profile/user`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: idToken,
            },
            body: JSON.stringify(profileData),
        });
    } catch (error) {
        console.log(error);
    }
};

export const handleQuestionsUpdate = async (idToken, answers) => {
    try {
        await fetch(`${backendUrl}/profile/questions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: idToken,
            },
            body: JSON.stringify({ answers }),
        });
    } catch (error) {
        console.log(error);
    }
};
