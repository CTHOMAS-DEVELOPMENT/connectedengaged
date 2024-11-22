import "./App.css";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import RegistrationForm from "./RegistrationProfileCreation/RegistrationForm";
import LoginForm from "./Login/LoginForm";
import FeedScreen from "./FeedScreen/FeedScreen";
import UserList from "./UserList/UserList";
import UserProfile from "./UserProfile/UserProfile";
import PhotoUploadAndEdit from "./PhotoUploadAndEdit/PhotoUploadAndEdit";
import NewSubmission from "./NewSubmission/NewSubmission";
import EditInteraction from "./EditInteraction/EditInteraction";
import PasswordResetRequest from "./PasswordResetRequest/PasswordResetRequest";
import PasswordReset from "./PasswordReset/PasswordReset"; // Import the component
import UpdateProfile from "./UpdateProfile/UpdateProfile";
import TextGenerator from "./OpenAI/TextGenerator";
import PrivacyPolicy from "./Login/PrivacyPolicy";
import GoodBye from "./system/GoodBye";

function App() {
  return (
    <Router>
        <div className="App">
          <Routes>
          <Route path="/goodbye" element={<GoodBye/>} />
            <Route path="/password-reset" element={<PasswordReset />} />
            <Route
              path="/password-reset-request"
              element={<PasswordResetRequest />}
            />

          <Route
            path="/privacy-policy"
            element={<PrivacyPolicyWithState />} // Use a wrapper component
          />
            <Route path="/editInteraction" element={<EditInteraction />} />
            <Route path="/userprofile/:userId" element={<UserProfile />} />
            <Route path="/newsubmission" element={<NewSubmission />} />
            <Route path="/userlist" element={<UserList />} />
            <Route path="/feed" element={<FeedScreen />} />
            <Route path="/photos" element={<PhotoUploadAndEdit />} />
            <Route path="/register" element={<RegistrationForm />} />
            <Route path="/profile" element={<UpdateProfile />} />
            <Route path="/" element={<LoginForm />} />
            <Route path="/textgenerator" element={<TextGenerator />} />

          </Routes>
        </div>
    </Router>
  );
}
const PrivacyPolicyWithState = () => {
  const location = useLocation();
  const selectedLanguage = location.state?.selectedLanguage || "en"; // Default to 'en' if no state is passed
  return <PrivacyPolicy selectedLanguage={selectedLanguage} />;
};
export default App;
