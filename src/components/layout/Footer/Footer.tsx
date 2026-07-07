import Image from "next/image";
import Link from "next/link";

const footerLinks = {
  prodotti: {
    title: "Prodotti",
    links: [
      { label: "Insegne", href: "/search/insultini-luminosi" },
      { label: "Zerbini", href: "/search/zerbini" },
      { label: "Specchi", href: "/search/specchi" },
      { label: "Gadget", href: "/search/gadget" },
      { label: "Accessori", href: "/search/accessori" },
    ],
  },
  info: {
    title: "Info",
    links: [
      { label: "Chi siamo", href: "/chi-siamo" },
      { label: "Contatti", href: "/contatti" },
      { label: "Cerca", href: "/search" },
    ],
  },
  spedizioni: {
    title: "Spedizioni",
    links: [
      { label: "Cookie Policy", href: "/cookie-policy" },
      { label: "FAQ", href: "/faq" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
};

const LinkedInIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="size-5"
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="size-5"
  >
    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
  </svg>
);

const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="size-5"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
  </svg>
);

export const Footer = () => {
  return (
    <footer className="relative bg-[#1a1a1a] pt-16 pb-8">
      {/* Subtle gradient line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-linear-to-r from-transparent via-cyan-400 to-transparent opacity-60" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Main footer content */}
        <div className="flex flex-col lg:flex-row lg:justify-between gap-12 lg:gap-8">
          {/* Logo */}
          <div className="shrink-0">
            <Link href="/" className="block">
              <Image
                src="/logo/logo_white_2xl.png"
                alt="Formatos Chile"
                width={100}
                height={100}
                className="h-auto w-48 lg:w-48"
              />
            </Link>
          </div>

          {/* Right side: Social + Links */}
          <div className="flex flex-col gap-8 lg:flex-row lg:gap-16 lg:items-start">
            {/* Social Icons */}
            <div className="flex items-center gap-5">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 transition-colors hover:text-white"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 transition-colors hover:text-white"
                aria-label="LinkedIn"
              >
                <LinkedInIcon />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 transition-colors hover:text-white"
                aria-label="Facebook"
              >
                <FacebookIcon />
              </a>
            </div>

            {/* Link Columns */}
            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:gap-16">
              {Object.values(footerLinks).map((section) => (
                <div key={section.title}>
                  <h3 className="mb-4 font-semibold tracking-wide text-white">
                    {section.title}
                  </h3>
                  <ul className="space-y-1">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <a
                          href={link.href}
                          className="text-sm text-white/70 transition-colors hover:text-white"
                        >
                          {link.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legal text */}
        <div className="border-white/10 mt-12">
          <p className="text-center text-xs leading-relaxed text-white/50">
            CHE FATICA SRL Sede legale Corso Monforte 41, Milano, 20122 - P. IVA
            12738470967 - Registro delle Imprese di Milano Monza Brianza Lodi -
            REA MI 2681648 - PEC chefaticasrl@legalmail.it - Capitale sociale
            €10.000,00
          </p>
        </div>
      </div>
    </footer>
  );
};
