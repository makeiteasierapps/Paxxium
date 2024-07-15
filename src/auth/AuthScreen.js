import { useState } from 'react';
import Login from './components/Login';
import SignUp from './components/SignUp';
import { StyledContainer } from './authStyledComponents';

const AuthScreen = () => {
    const [isLogin, setIsLogin] = useState(true);
    return (
        <StyledContainer>
            {isLogin ? (
                <Login setIsLogin={setIsLogin} />
            ) : (
                <SignUp setIsLogin={setIsLogin} />
            )}
        </StyledContainer>
    );
};

export default AuthScreen;
