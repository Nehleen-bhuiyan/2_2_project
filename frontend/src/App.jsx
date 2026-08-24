import {
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Studio from "./pages/Studio";
import SignalLab from "./pages/SignalLab";
import AuthPage  from "./pages/AuthPage";


const App = () => {
  return (
    <div
      className="
        min-h-screen
        bg-[var(--bg-main)]
        text-[var(--text-main)]
      "
    >
      <Navbar />

      {/* Navbar is fixed, so give pages top spacing */}
      <main className="pt-20">
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/studio"
            element={<Studio />}
          />

          <Route
            path="/signal-lab"
            element={<SignalLab />}
          />
        <Route
            path="/auth"
            element={<AuthPage />}
          />
          


          {/* 404 */}
          <Route
            path="*"
            element={
              <div className="flex min-h-[70vh] items-center justify-center">
                <h1 className="text-3xl font-bold">
                  Page not found
                </h1>
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
};

export default App;