export interface FaqEntry {
  title: string;
  description: string;
}

/**
 * Shared FAQ content. The home page shows the first entries
 * (`HOME_FAQ_COUNT`); `/preguntas-frecuentes` shows the full list.
 */
export const faqs: FaqEntry[] = [
  {
    title: "¿El documento sirve en Chile?",
    description:
      "Sí. Todas nuestras plantillas están redactadas conforme a la normativa legal chilena vigente, listas para usarse en Chile.",
  },
  {
    title: "¿Lo revisó un abogado?",
    description:
      "Sí. Cada documento ha sido desarrollado y revisado con el apoyo de abogados especializados del estudio jurídico asociado RK Abogados.",
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
  {
    title: "¿Cómo compro un documento?",
    description:
      "Explora nuestra biblioteca de documentos, elige la plantilla que se ajusta a lo que necesitas, agrégala al carrito y completa el pago de forma segura.",
  },
  {
    title: "¿Cuándo recibo mi documento?",
    description:
      "De inmediato. Una vez completada la compra, accedes a tu documento en formato editable (Word/PDF) para completarlo y usarlo.",
  },
  {
    title: "¿Tuve un problema con mi compra, a quién escribo?",
    description:
      "Escríbenos a través de nuestra página de contacto y te ayudaremos a resolverlo lo antes posible.",
  },
];

export const HOME_FAQ_COUNT = 5;
