import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Plus,
  Music2,
  X,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";


const Studio = () => {
  const { user } = useAuth();

  const navigate =
    useNavigate();

  const [
    projects,
    setProjects,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    creating,
    setCreating,
  ] = useState(false);

  const [
    showCreateDialog,
    setShowCreateDialog,
  ] = useState(false);

  const [
    projectName,
    setProjectName,
  ] = useState("");


  // =========================================
  // LOAD PROJECTS
  // =========================================

  useEffect(() => {
    if (!user) {
      return;
    }

    const loadProjects =
      async () => {
        setLoading(true);

        try {
          const response =
            await api.get(
              "/projects"
            );

          setProjects(
            response.data
              .projects || []
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
  // OPEN CREATE DIALOG
  // =========================================

  const handleOpenCreateDialog =
    () => {

      if (!user) {
        navigate("/login");
        return;
      }

      setProjectName("");

      setShowCreateDialog(
        true
      );
    };


  // =========================================
  // CLOSE CREATE DIALOG
  // =========================================

  const handleCloseCreateDialog =
    () => {

      if (creating) {
        return;
      }

      setShowCreateDialog(
        false
      );

      setProjectName("");
    };


  // =========================================
  // CREATE PROJECT
  // =========================================

  const handleCreateProject =
    async (event) => {

      event?.preventDefault();


      const cleanedName =
        projectName.trim();


      if (!cleanedName) {
        return;
      }


      try {
        setCreating(true);


        const response =
          await api.post(
            "/projects",
            {
              name:
                cleanedName,
            }
          );


        const project =
          response.data.project;


        setShowCreateDialog(
          false
        );


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
    <>
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
              handleOpenCreateDialog
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
              New Project
            </p>
          </button>


          {/* EXISTING PROJECTS */}

          {projects.map(
            (project) => (
              <button
                key={
                  project.id
                }

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


      {/* =====================================
          CREATE PROJECT DIALOG
      ===================================== */}

      {showCreateDialog && (
        <div
          className="
            fixed
            inset-0
            z-[1000]

            flex
            items-center
            justify-center

            bg-black/70

            px-4

            backdrop-blur-sm
          "

          onMouseDown={
            handleCloseCreateDialog
          }
        >

          <form
            onSubmit={
              handleCreateProject
            }

            onMouseDown={(
              event
            ) => {
              event.stopPropagation();
            }}

            className="
              relative

              w-full
              max-w-md

              rounded-2xl

              border
              border-white/10

              bg-[#101514]

              p-6

              shadow-[0_25px_80px_rgba(0,0,0,0.55)]
            "
          >

            {/* CLOSE BUTTON */}

            <button
              type="button"

              onClick={
                handleCloseCreateDialog
              }

              disabled={
                creating
              }

              className="
                absolute
                right-4
                top-4

                flex
                h-8
                w-8

                cursor-pointer

                items-center
                justify-center

                rounded-lg

                text-gray-500

                transition

                hover:bg-white/10
                hover:text-white
              "
            >
              <X size={18} />
            </button>


            {/* TITLE */}

            <h2
              className="
                text-xl
                font-semibold
                text-white
              "
            >
              Create Project
            </h2>

            <p
              className="
                mt-2
                text-sm
                text-gray-500
              "
            >
              Give your audio project a name.
            </p>


            {/* INPUT */}

            <div className="mt-6">
              <label
                className="
                  mb-2
                  block
                  text-sm
                  font-medium
                  text-gray-300
                "
              >
                Project Name
              </label>

              <input
                autoFocus

                type="text"

                value={
                  projectName
                }

                onChange={(
                  event
                ) =>
                  setProjectName(
                    event.target.value
                  )
                }

                placeholder="My Audio Project"

                maxLength={255}

                className="
                  w-full

                  rounded-xl

                  border
                  border-white/10

                  bg-black/20

                  px-4
                  py-3

                  text-sm
                  text-white

                  outline-none

                  transition

                  placeholder:text-gray-600

                  focus:border-[var(--accent)]/60
                  focus:ring-2
                  focus:ring-[var(--accent)]/10
                "
              />
            </div>


            {/* BUTTONS */}

            <div
              className="
                mt-6

                flex
                justify-end
                gap-3
              "
            >

              <button
                type="button"

                onClick={
                  handleCloseCreateDialog
                }

                disabled={
                  creating
                }

                className="
                  cursor-pointer

                  rounded-xl

                  px-4
                  py-2.5

                  text-sm
                  font-medium
                  text-gray-400

                  transition

                  hover:bg-white/10
                  hover:text-white

                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                Cancel
              </button>


              <button
                type="submit"

                disabled={
                  creating ||
                  !projectName.trim()
                }

                className="
                  cursor-pointer

                  rounded-xl

                  bg-[var(--accent)]

                  px-5
                  py-2.5

                  text-sm
                  font-semibold
                  text-black

                  transition

                  hover:bg-[var(--accent-hover)]

                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                {creating
                  ? "Creating..."
                  : "Create Project"}
              </button>

            </div>

          </form>
        </div>
      )}
    </>
  );
};

export default Studio;