import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto my-4 flex max-w-xl flex-col rounded-lg border border-neutral-200 bg-white p-8 md:p-12">
      <h2 className="text-xl font-bold">Página no encontrada</h2>
      <p className="my-2">
        La página que buscas no existe o fue movida. Revisa el enlace o vuelve
        al inicio.
      </p>
      <Link
        href="/"
        className="bg-brand-ink mx-auto mt-4 flex w-full items-center justify-center rounded-full p-4 tracking-wide text-white hover:opacity-90"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
