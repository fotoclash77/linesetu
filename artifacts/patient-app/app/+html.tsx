import { ScrollViewStyleReset } from "expo-router/html";
import { type PropsWithChildren } from "react";

export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no"
        />
        <meta name="theme-color" content="#060A14" />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: rawCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const rawCss = `
html, body, #root {
  background-color: #060A14;
}
body {
  margin: 0;
}
`;
