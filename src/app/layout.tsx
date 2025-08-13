import "@mantine/core/styles.css";

import React from "react";
import {
  createTheme,
  ColorSchemeScript,
  mantineHtmlProps,
  MantineProvider,
} from "@mantine/core";
import AppLayout from "./_components/App";

export const metadata = {
  title: "氷川かき氷",
  description: "氷川かき氷",
};

const theme = createTheme({
  primaryColor: "cyan",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <MantineProvider theme={theme}>
          <AppLayout>{children}</AppLayout>
        </MantineProvider>
      </body>
    </html>
  );
}
