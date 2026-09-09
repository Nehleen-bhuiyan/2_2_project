const BlurCircle = ({
  className = "",
  size = 300,
  color = "teal",
}) => {

  const colors = {
    teal:
      "rgba(25, 211, 197, 0.20)",

    purple:
      "rgba(139, 92, 246, 0.18)",

    pink:
      "rgba(236, 72, 153, 0.18)",
  };


  return (
    <div
      className={`
        pointer-events-none

        absolute

        rounded-full

        blur-[120px]

        ${className}
      `}

      style={{
        width:
          `${size}px`,

        height:
          `${size}px`,

        background:
          colors[color] ||
          colors.teal,
      }}
    />
  );
};


export default BlurCircle;