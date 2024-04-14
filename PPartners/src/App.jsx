import "./App.css";
import LoginSignup from "./Components/LoginSignup/LoginSignup";
import LoginPage from "./Components/Pages/LogPage/LogPage";
import RegistrationPage from "./Components/Pages/RegPage/RegPage";
import ForgotPasswordPage from "./Components/Pages/PasswordRecovery/PR_phonePage"
import ResetPasswordPage from "./Components/Pages/PasswordRecovery/PR_phoneCode_newPW"
function App() {
  return (
    <>
      {/* <LoginSignup/> */}
      {/* <RegistrationPage /> */}
      {/* <LoginPage/> */}
      <ForgotPasswordPage/>
      {/* <ResetPasswordPage/> */}
    </>
  );
}

export default App;
