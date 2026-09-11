import { NavLink } from "react-router-dom";
import { Home, Activity, Wand2 } from "lucide-react";
import { EFFECTS } from "../../data/signalLabEffects";

const SignalLabSidebar = () => {
  const categories = [...new Set(EFFECTS.map((e) => e.category))];

  const linkClass = ({ isActive }) =>
    `flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${
      isActive
        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
        : "text-[var(--text-muted)] hover:bg-white/[0.05] hover:text-white"
    }`;

  return (
    <aside className="shrink-0 border-white/10 md:sticky md:top-24 md:w-64 md:self-start md:border-r md:pr-4">
      <nav className="flex gap-2 overflow-x-auto pb-3 hide-scrollbar md:flex-col md:overflow-visible md:pb-0">
        <NavLink to="/signal-lab" end className={linkClass}>
          <Home size={16} />
          Home
        </NavLink>

        <div className="mt-2 hidden md:block">
          <p className="mb-1 px-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
            Effects
          </p>
        </div>

        {categories.map((category) => (
          <div key={category} className="shrink-0 md:mt-1">
            <p className="hidden px-3 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]/70 md:block">
              {category}
            </p>
            <div className="flex gap-2 md:flex-col">
              {EFFECTS.filter((e) => e.category === category).map((effect) => (
                <NavLink key={effect.id} to={`/signal-lab/${effect.id}`} className={linkClass}>
                  <Activity size={14} />
                  {effect.name}
                </NavLink>
              ))}
            </div>
          </div>
        ))}

        <div className="mt-2 shrink-0 md:mt-3 md:border-t md:border-white/10 md:pt-3">
          <p className="hidden px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-[var(--text-muted)]/70 md:block">
            Workspace
          </p>
          <NavLink to="/signal-lab/custom" className={linkClass}>
            <Wand2 size={14} />
            Custom Waveform
          </NavLink>
        </div>
      </nav>
    </aside>
  );
};

export default SignalLabSidebar;
