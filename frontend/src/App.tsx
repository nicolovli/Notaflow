import { Header } from "./components/Header";
import { Routes, Route} from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { UserPage } from "./pages/UserPage";

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
    <>
      <Header />
      <Routes>
        {/* TODO change path / to login page? For now it is dashboardpage */}
        <Route path="/" element={<DashboardPage />} />
        <Route path="/Dashboard" element={<DashboardPage />} />
        <Route path="/user" element={<UserPage />} />
      </Routes>
    </>
  );
};
