export const HomeHero = () => {
  return (
    <div className="h-dvh w-dvw relative bg-black">
      <div className="h-full w-1/2 flex flex-col justify-center items-start">
        <h1>formatos.cl</h1>
      </div>

      <div className="absolute inset-0 w-1/2 h-full z-0">
        <h2>Something here</h2>
      </div>
    </div>
  );
};
