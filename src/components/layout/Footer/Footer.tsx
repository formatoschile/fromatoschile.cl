import Image from "next/image";
import Link from "next/link";

const supportLinks = [
  { label: "Centro de ayuda", href: "/centro-de-ayuda" },
  { label: "Preguntas frecuentes", href: "/preguntas-frecuentes" },
  { label: "Cómo personalizar", href: "/como-personalizar" },
  { label: "Contacto", href: "/contacto" },
  { label: "Soporte legal", href: "/soporte-legal" },
] as const;

export const Footer = () => {
  return (
    <footer className="bg-graphite px-6 pt-14 pb-8 font-[family-name:var(--font-dm-sans)] text-white lg:px-16">
      <div className="mx-auto flex max-w-7xl flex-col justify-between gap-12 md:flex-row md:gap-8">
        {/* Logo */}
        <Link
          href="/"
          className="block shrink-0 transition-opacity hover:opacity-80"
        >
          <Image
            src="/logo/formatos_chile_light.png"
            alt="Formatos Chile"
            width={566}
            height={104}
            className="h-auto w-64 sm:w-80 lg:w-[420px]"
          />
        </Link>

        {/* Support links */}
        <nav aria-label="Ayuda y soporte">
          <h2 className="text-xs tracking-wider text-[#F5F5F580] uppercase">
            Ayuda y soporte
          </h2>

          <ul className="mt-3 space-y-1.5">
            {supportLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-xs tracking-wider text-white uppercase transition-opacity hover:opacity-70"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Legal text */}
      <div className="mx-auto mt-14 max-w-7xl">
        <p className="text-primary text-xs">
          © 2026 Formatos Chile. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};
