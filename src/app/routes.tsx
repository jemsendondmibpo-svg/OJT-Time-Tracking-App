import { createBrowserRouter } from 'react-router';
import { SetupForm } from './components/SetupForm';
import { Dashboard } from './components/Dashboard';
import { LoginPage } from './components/LoginPage';
import { SignupPage } from './components/SignupPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: LoginPage,
  },
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/signup',
    Component: SignupPage,
  },
  {
    path: '/setup',
    Component: SetupForm,
  },
  {
    path: '/dashboard',
    Component: Dashboard,
  },
]);