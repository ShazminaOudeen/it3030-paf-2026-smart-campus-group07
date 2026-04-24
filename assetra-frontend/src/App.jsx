import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./shared/context/ThemeContext";
import Navbar from "./shared/components/Navbar";
import Footer from "./shared/components/Footer";
import HomePage from "./pages/HomePage";
import RegisterPage from "./notification/pages/RegisterPage";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}