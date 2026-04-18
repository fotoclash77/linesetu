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
        <meta name="theme-color" content="#0A0E1A" />
        <ScrollViewStyleReset />
        <script dangerouslySetInnerHTML={{ __html: trailingSlashFix }} />
        <style dangerouslySetInnerHTML={{ __html: rawCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const trailingSlashFix = `
(function(){
  var p = window.location.pathname;
  if (p === '/patient-app') {
    window.location.replace('/patient-app/');
  }
})();
`;

const rawCss = `
html, body, #root {
  background-color: #0A0E1A;
  color-scheme: dark;
}
html, body {
  margin: 0;
  padding: 0;
  min-height: 100%;
}
#root {
  min-height: 100vh;
}
`;
