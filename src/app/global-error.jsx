"use client";

import * as Sentry from "@sentry/nextjs";
import { Error as NextError } from "next/error";
import * as React from "react";

export default function GlobalError({ error }) {
  React.useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body>
        <NextError />
      </body>
    </html>
  );
}
