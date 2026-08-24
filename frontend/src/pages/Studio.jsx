import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Music2 } from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

const Studio = () => {
  const { user } = useAuth();

  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);


  // =========================================
  // LOAD PROJECTS
  // =========================================

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


  // =========================================
  // CREATE PROJECT
  // =========================================

  const handleCreateProject = async () => {
    if (!user) {
      alert(
        "Please login before creating a project."
      );

      navigate("/login");

      return;
    }

    try {
      setCreating(true);

      const response =
        await api.post(
          "/projects",
          {
            name: "Untitled Project",
          }
        );

      const project =
        response.data.project;

      navigate(
        `/studio/${project.id}`
      );

    } catch (error) {
      console.error(
        "Failed to create project:",
        error
      );

      alert(
        "Could not create project."
      );

    } finally {
      setCreating(false);
    }
  };


  // =========================================
  // OPEN PROJECT
  // =========================================

  const openProject = (
    projectId
  ) => {
    navigate(
      `/studio/${projectId}`
    );
  };


  // =========================================
  // FULL SCREEN LOADER
  // =========================================

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


  // =========================================
  // PAGE
  // =========================================

  return (
    <div
      className="
        mx-auto
        max-w-7xl
        px-8
        py-10
      "
    >
      {/* HEADER */}

      <div className="mb-10">
        <h1
          className="
            text-4xl
            font-bold
          "
        >
          Editing Studio
        </h1>

        <p
          className="
            mt-3
            text-gray-400
          "
        >
          Create a new project or continue
          working on an existing one.
        </p>
      </div>


      {/* PROJECT GRID */}

      <div
        className="
          grid
          grid-cols-1
          gap-6

          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
        "
      >

        {/* NEW PROJECT */}

        <button
          onClick={
            handleCreateProject
          }

          disabled={
            creating
          }

          className="
            group

            flex
            min-h-[190px]

            cursor-pointer

            flex-col
            items-center
            justify-center

            rounded-2xl

            border
            border-dashed
            border-[var(--accent)]/50

            bg-[var(--accent-soft)]

            transition-all
            duration-300

            hover:border-[var(--accent)]

            hover:shadow-[0_0_30px_rgba(25,211,197,0.12)]

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <div
            className="
              flex
              h-14
              w-14

              items-center
              justify-center

              rounded-full

              bg-[var(--accent)]

              text-black

              transition

              group-hover:scale-110
            "
          >
            <Plus size={28} />
          </div>

          <p
            className="
              mt-4
              font-semibold
            "
          >
            {creating
              ? "Creating..."
              : "New Project"}
          </p>
        </button>


        {/* EXISTING PROJECTS */}

        {projects.map(
          (project) => (
            <button
              key={project.id}

              onClick={() =>
                openProject(
                  project.id
                )
              }

              className="
                group

                min-h-[190px]

                cursor-pointer

                rounded-2xl

                border
                border-white/10

                bg-white/[0.04]

                p-5

                text-left

                transition-all
                duration-300

                hover:border-[var(--accent)]/50
                hover:bg-white/[0.07]
              "
            >
              <div
                className="
                  mb-8

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
                  className="
                    text-[var(--accent)]
                  "
                  size={22}
                />
              </div>

              <h2
                className="
                  truncate
                  text-lg
                  font-semibold
                  text-white
                "
              >
                {project.name}
              </h2>

              <p
                className="
                  mt-2
                  text-sm
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
    </div>
  );
};

export default Studio;