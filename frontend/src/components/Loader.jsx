const Loader = ({ size = 48 }) => {
  return (
    <div
      className="
        inline-flex
        shrink-0
        items-center
        justify-center
      "
      style={{
        width: `${size}px`,
        height: `${size}px`,
      }}
    >
      <div
        className="
          h-full
          w-full
          animate-spin
          rounded-full
          border-4
          border-white/10
          border-t-[var(--accent)]
        "
      />
    </div>
  );
};

export default Loader;