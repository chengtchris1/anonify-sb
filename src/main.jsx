import React from "react";
import * as ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App.jsx";
import "./index.css";
import { CookiesProvider, useCookies } from "react-cookie";
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
const qc = new QueryClient();
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <QueryClientProvider client={qc}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} client={qc} />
  </QueryClientProvider>
);
