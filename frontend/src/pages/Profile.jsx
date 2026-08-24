import {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import { Music2 } from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";


const Profile = () => {
  const { user } = useAuth();

  const navigate = useNavigate();

  const [projects, setProjects] =
    useState([]);

  const [loading, setLoading] =
    useState(false);


  // ==========================================
  // LOAD PROJECTS
  // ==========================================

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadProjects = async () => {
      setLoading(true);

      try {
        const response =
          await api.get("/projects");

        setProjects(
          response.data.projects || []
        );

      } catch (error) {
        console.error(
          "Failed to load projects:",
          error
        );

      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, [user]);


  // ==========================================
  // NOT LOGGED IN
  // ==========================================

  if (!user) {
    return (
      <div
        className="
          flex
          min-h-[70vh]
          flex-col
          items-center
          justify-center
        "
      >
        <h1
          className="
            text-2xl
            font-bold
          "
        >
          Login to view your profile
        </h1>

        <button
          onClick={() =>
            navigate("/login")
          }
          className="
            mt-6
            cursor-pointer
            rounded-full
            bg-[var(--accent)]
            px-6
            py-3
            font-semibold
            text-black
          "
        >
          Login
        </button>
      </div>
    );
  }


  // ==========================================
  // FULL SCREEN LOADER
  // ==========================================

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[calc(100vh-100px)]
          w-full
          items-center
          justify-center
        "
      >
        <Loader size={52} />
      </div>
    );
  }


  // ==========================================
  // PAGE
  // ==========================================

  return (
    <div
      className="
        mx-auto
        max-w-7xl
        px-8
        py-10
      "
    >
      {/* USER */}

      <div className="mb-12">
        <h1
          className="
            text-3xl
            font-bold
          "
        >
          {user.name}
        </h1>

        <p
          className="
            mt-2
            text-gray-500
          "
        >
          {user.email}
        </p>
      </div>


      {/* SAVED PROJECTS */}

      <h2
        className="
          mb-6
          text-xl
          font-semibold
        "
      >
        Saved Projects
      </h2>


      {/* NO PROJECTS */}

      {projects.length === 0 ? (
        <div
          className="
            flex
            min-h-[220px]
            items-center
            justify-center
            rounded-2xl
            border
            border-dashed
            border-white/10
            text-sm
            text-gray-500
          "
        >
          No saved projects yet.
        </div>
      ) : (

        <div
          className="
            grid
            grid-cols-1
            gap-5

            sm:grid-cols-2
            lg:grid-cols-3
          "
        >
          {projects.map(
            (project) => (
              <button
                key={project.id}

                onClick={() =>
                  navigate(
                    `/studio/${project.id}`
                  )
                }

                className="
                  group

                  cursor-pointer

                  rounded-2xl

                  border
                  border-white/10

                  bg-white/[0.04]

                  p-5

                  text-left

                  transition-all
                  duration-300

                  hover:border-[var(--accent)]/40
                  hover:bg-white/[0.07]
                "
              >
                <div
                  className="
                    mb-6

                    flex
                    h-11
                    w-11

                    items-center
                    justify-center

                    rounded-xl

                    bg-[var(--accent-soft)]
                  "
                >
                  <Music2
                    size={22}
                    className="
                      text-[var(--accent)]
                    "
                  />
                </div>


                <h3
                  className="
                    truncate
                    font-semibold
                    text-white
                  "
                >
                  {project.name}
                </h3>


                <p
                  className="
                    mt-2
                    text-xs
                    text-gray-500
                  "
                >
                  Version{" "}
                  {project.version}
                </p>
              </button>
            )
          )}
        </div>
      )}

    </div>
  );
};


export default Profile;