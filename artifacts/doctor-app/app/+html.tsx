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
        <meta name="theme-color" content="#060E12" />
        <ScrollViewStyleReset />
        {/* Ensure trailing slash so Expo Router can match the index route.
            The Replit reverse-proxy silently rewrites /doctor-app → /doctor-app
            without adding a slash, leaving window.location.pathname as "/doctor-app".
            Expo Router strips the base URL ("/doctor-app") and gets "" (empty string)
            which it cannot match. This script fires before React hydrates and fixes it. */}
        <script dangerouslySetInnerHTML={{ __html: trailingSlashFix }} />
        <style dangerouslySetInnerHTML={{ __html: rawCss }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

// Runs synchronously in <head> before any React code.
// If the page was loaded at exactly "/doctor-app" (no trailing slash),
// replace the URL with "/doctor-app/" so Expo Router can match "/".
const trailingSlashFix = `
(function(){
  var p = window.location.pathname;
  if (p === '/doctor-app') {
    window.location.replace('/doctor-app/');
  }
})();
`;

const rawCss = `
html, body, #root {
  background-color: #060E12;
}
body {
  margin: 0;
}
`;
