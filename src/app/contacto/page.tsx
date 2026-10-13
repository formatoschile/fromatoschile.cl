import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "¿Tienes dudas sobre tu compra o nuestros documentos? Escríbenos y te ayudaremos.",
  alternates: {
    canonical: "/contacto",
  },
};

const CONTACT_EMAIL = "contacto@formatos.cl";

export default function ContactPage() {
  return (
    <div className="bg-primary text-ink min-h-dvh pt-20">
      <section className="section-inset bg-white py-20">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-ink text-4xl font-normal sm:text-5xl">
            Contacto
          </h1>

          <p className="mt-8 text-lg text-neutral-700">
            ¿Tienes dudas sobre un documento, tu compra o la descarga?
            Escríbenos y te responderemos lo antes posible.
          </p>

          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="bg-graphite mt-8 inline-block rounded-md px-6 py-3 text-sm font-normal tracking-wide text-white transition-opacity hover:opacity-90"
          >
            {CONTACT_EMAIL}
          </a>

          <p className="mt-12 text-base text-neutral-600">
            Si necesitas asesoría legal personalizada, puedes contactar
            directamente al estudio jurídico asociado,{" "}
            <a
              href="https://www.rkabogados.cl"
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink font-bold underline underline-offset-4 hover:opacity-70"
            >
              RK Abogados
            </a>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
