import { Accordion } from "@/components/ui/Accordion/Accordion";

const faqs = [
  {
    title: "¿El documento sirve en Chile?",
    description:
      "Sí. Todas nuestras plantillas están redactadas conforme a la normativa legal chilena vigente, listas para usarse en Chile.",
  },
  {
    title: "¿Lo revisó un abogado?",
    description:
      "Sí. Cada documento ha sido desarrollado y revisado con el apoyo de abogados especializados de nuestro estudio jurídico asociado.",
  },
  {
    title: "¿Puedo editarlo?",
    description:
      "Por supuesto. Recibes el documento en formato editable (Word y PDF) para que puedas adaptarlo a tu situación particular.",
  },
  {
    title: "¿Qué pasa si no sé cómo completarlo?",
    description:
      "Cada plantilla incluye instrucciones claras. Si necesitas ayuda adicional, puedes solicitar asesoría personalizada con RK Abogados.",
  },
  {
    title: "¿Es lo mismo que una asesoría legal?",
    description:
      "No. Nuestros documentos son plantillas listas para usar. Para una asesoría legal personalizada puedes contactar directamente a RK Abogados.",
  },
];

export const Faq = () => {
  return (
    <section className="section-inset bg-white py-20">
      <div className="mx-auto max-w-7xl">
        <h2 className="text-ink text-4xl font-normal sm:text-5xl">FAQ</h2>

        <Accordion entries={faqs} />
      </div>
    </section>
  );
};
