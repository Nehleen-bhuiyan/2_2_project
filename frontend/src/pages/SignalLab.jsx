import { useParams, Navigate } from "react-router-dom";

import SignalLabSidebar from "../components/signalLab/SignalLabSidebar";
import SignalLabHome from "../components/signalLab/SignalLabHome";
import SignalLabEffectTab from "../components/signalLab/SignalLabEffectTab";
import SignalLabCustomTab from "../components/signalLab/SignalLabCustomTab";
import { getEffectById } from "../data/signalLabEffects";

const SignalLab = () => {
  const { effectId } = useParams();
  const isCustom = effectId === "custom";
  const effect = effectId && !isCustom ? getEffectById(effectId) : null;

  if (effectId && !isCustom && !effect) {
    return <Navigate to="/signal-lab" replace />;
  }

  let content = <SignalLabHome />;
  if (isCustom) content = <SignalLabCustomTab key="custom" />;
  else if (effect) content = <SignalLabEffectTab key={effect.id} effect={effect} />;

  return (
    <div className="mx-auto max-w-7xl px-6 pb-24">
      <div className="flex flex-col gap-8 md:flex-row">
        <SignalLabSidebar />
        <div className="min-w-0 flex-1">{content}</div>
      </div>
    </div>
  );
};

export default SignalLab;
