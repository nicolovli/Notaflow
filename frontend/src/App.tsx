import { Header } from "./components/Header";
import { Routes, Route } from "react-router-dom";
import { DashboardPage } from "./pages/DashboardPage";
import PublishingPage from "./pages/PublishingPage";
import { CourseDetailPage } from "./pages/CourseDetailPage";
import { RegistrationPage } from "./pages/RegistrationPage";
import NotePage from "./pages/NotePage";
import { LoginPage } from "./pages/LoginPage";
import { UserPage } from "./pages/UserPage";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { MyNotesPage } from "./pages/MyNotesPage";
import { FavoriteNotesPage } from "./pages/FavoriteNotesPage";
import NavigationDrawer from "./components/NavigationDrawer";
import FloatingPlusButton from "./components/FloatingPlusButton";
import CreateCoursePage from "./pages/CreateCoursePage";
import GlobalSnackbar from "./components/GlobalSnackBar";
import PrivateGroupsPage from "./pages/PrivateGroupsPage";
import { CreateCategoryPage } from "./pages/CreateCategoryPage";

/**
 * Root component of the application.
 *
 * ## Responsibilities:
 * - **Routing**: Defines app routes using 'react-router-dom'.
 *
 * Here we define the routes of the application and the components that will be rendered when the user navigates to them.
 * Therefore use <Route path="/path" element={<Component />} /> to define a route.
 */

export const App = () => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateRows: "auto 1fr", // header = auto, main content fills the rest
        minHeight: "100vh",
      }}>
      <FloatingPlusButton />
      <Header />
      <div style={{ display: "flex" }}>
        <NavigationDrawer />
        <div style={{ flexGrow: 1, overflow: "auto" }}>
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/Login" element={<LoginPage />} />
            <Route path="/Dashboard" element={<DashboardPage />} />
            <Route path="/course/:id" element={<CourseDetailPage />} />
            <Route path="/Registration" element={<RegistrationPage />} />
            <Route path="/notes/:id" element={<NotePage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/user" element={<UserPage />} />
              <Route path="/myNotes" element={<MyNotesPage />} />
              <Route path="/myFavoriteNotes" element={<FavoriteNotesPage />} />
              <Route path="/PublishingPage" element={<PublishingPage />} />
              <Route path="/createCourse" element={<CreateCoursePage />} />
              <Route path="/publishingpage/:id" element={<PublishingPage />} />
              <Route path="/createCourse/:id" element={<CreateCoursePage />} />
              <Route path="/createCategory" element={<CreateCategoryPage />} />
              <Route path="/privateGroupPage" element={<PrivateGroupsPage />} />
            </Route>
          </Routes>
        </div>
      </div>
      <GlobalSnackbar />
    </div>
  );
};
