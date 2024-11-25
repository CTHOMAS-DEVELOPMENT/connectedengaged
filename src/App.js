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
import PasswordReset from "./PasswordReset/PasswordReset";
import UpdateProfile from "./UpdateProfile/UpdateProfile";
import TextGenerator from "./OpenAI/TextGenerator";
import PrivacyPolicy from "./Login/PrivacyPolicy";
import GoodBye from "./system/GoodBye";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LoginForm />} />
          <Route path="/register" element={<RegistrationForm />} />

          {/* Protected Routes */}
          <Route
            path="/feed"
            element={
              <ProtectedRoute>
                <FeedScreen />
              </ProtectedRoute>
            }
          />
          <Route
            path="/userlist"
            element={
              <ProtectedRoute>
                <UserList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/userprofile/:userId"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/photos"
            element={
              <ProtectedRoute>
                <PhotoUploadAndEdit />
              </ProtectedRoute>
            }
          />
          <Route
            path="/newsubmission"
            element={
              <ProtectedRoute>
                <NewSubmission />
              </ProtectedRoute>
            }
          />
          <Route
            path="/editInteraction"
            element={
              <ProtectedRoute>
                <EditInteraction />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <UpdateProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/textgenerator"
            element={
              <ProtectedRoute>
                <TextGenerator />
              </ProtectedRoute>
            }
          />
          <Route
            path="/goodbye"
            element={
              <ProtectedRoute>
                <GoodBye />
              </ProtectedRoute>
            }
          />
          <Route
            path="/password-reset"
            element={
              <ProtectedRoute>
                <PasswordReset />
              </ProtectedRoute>
            }
          />
          <Route
            path="/password-reset-request"
            element={
              <ProtectedRoute>
                <PasswordResetRequest />
              </ProtectedRoute>
            }
          />
          <Route
            path="/privacy-policy"
            element={
              <ProtectedRoute>
                <PrivacyPolicyWithState />
              </ProtectedRoute>
            }
          />
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
