import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { App } from './App.tsx'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './components/AuthContext.tsx'

/**
 * Entry point of the React application.
 * 
 * This file mounts the 'App' component to the DOM, setting up React and routing. 
 * 
 * ## Key Components: 
 * - **BrowserRouter**: Enables navigation without full page reloads. 
 * - **StrictMode**: Highlights potential issues during development. 
 * - **createRoot**: Renders the app using React's concurrent mode.
 * 
 * This file runs automatically when the app starts.
 */

//Get the root DOM element where the application will be mounted. 
const container = document.getElementById('root')!;
//Create a root for rendering the application. 
const root = createRoot(container);

//Render the application.
root.render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
)
