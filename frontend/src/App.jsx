import { Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import AuthPage from "./pages/AuthPage";
import Studio from "./pages/Studio";
import ProjectEditor from "./pages/ProjectEditor";
import SignalLab from "./pages/SignalLab";
import Profile from "./pages/Profile";

const App = () => {
  const location = useLocation();

  const isProjectEditor =
    location.pathname.startsWith("/studio/");

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-white">
      {!isProjectEditor && <Navbar />}

      <main className={isProjectEditor ? "" : "pt-24"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/studio" element={<Studio />} />
          <Route
            path="/studio/:projectId"
            element={<ProjectEditor />}
          />
          <Route path="/signal-lab" element={<SignalLab />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;