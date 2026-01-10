import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
<<<<<<< HEAD
import { TimerProvider } from './contexts/TimerContext';
=======
>>>>>>> c9e3c0c21af8e856d805ae17667927407441d415
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import MyRecipes from './pages/MyRecipes';
import AddRecipe from './pages/AddRecipe';
import RecipeDetail from './pages/RecipeDetail';
import Favorites from './pages/Favorites';
import Profile from './pages/Profile';
import ShoppingList from './pages/ShoppingList';
<<<<<<< HEAD
import TimerPage from './pages/TimerPage';
=======
>>>>>>> c9e3c0c21af8e856d805ae17667927407441d415
import Terms from './pages/Terms';
import PublicRecipe from './pages/PublicRecipe';

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
<<<<<<< HEAD
          <TimerProvider>
            <Toaster position="top-center" />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/share/:token" element={<PublicRecipe />} />

              {/* Protected Routes */}
              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/my-recipes" element={<MyRecipes />} />
                  <Route path="/add-recipe" element={<AddRecipe />} />
                  <Route path="/edit-recipe/:id" element={<AddRecipe />} />
                  <Route path="/recipe/:id" element={<RecipeDetail />} />
                  <Route path="/favorites" element={<Favorites />} />
                  <Route path="/shopping-list" element={<ShoppingList />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/timer" element={<TimerPage />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </TimerProvider>
=======
          <Toaster position="top-center" />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/share/:token" element={<PublicRecipe />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/my-recipes" element={<MyRecipes />} />
                <Route path="/add-recipe" element={<AddRecipe />} />
                <Route path="/edit-recipe/:id" element={<AddRecipe />} />
                <Route path="/recipe/:id" element={<RecipeDetail />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/shopping-list" element={<ShoppingList />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
>>>>>>> c9e3c0c21af8e856d805ae17667927407441d415
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
