"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="es-CL">
      <body style={{ fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            margin: "1rem auto",
            maxWidth: "36rem",
            display: "flex",
            flexDirection: "column",
            borderRadius: "0.5rem",
            border: "1px solid #e5e5e5",
            padding: "2rem",
          }}
        >
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700 }}>¡Ups!</h2>
          <p style={{ margin: "0.5rem 0" }}>
            Hubo un problema con nuestro sitio. Puede ser un problema temporal;
            por favor, inténtalo de nuevo.
          </p>
          <button
            style={{
              marginTop: "1rem",
              borderRadius: "9999px",
              backgroundColor: "#2563eb",
              padding: "1rem",
              color: "white",
              letterSpacing: "0.025em",
              cursor: "pointer",
            }}
            onClick={reset}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
