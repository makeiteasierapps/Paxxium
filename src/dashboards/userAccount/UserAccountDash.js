import User from "./User";
import NewPassword from "./NewPassword";
import { StyledContainer } from "../styledComponents/DashStyledComponents";

const UserAccountDash = () => {
  return (
    <StyledContainer id="main-container">
      <User />
      <NewPassword />
    </StyledContainer>
  );
};

export default UserAccountDash;
