
  import { createRoot } from "react-dom/client";
  import { AppRouter } from "./app/AppRouter";
  import { LangProvider } from "./app/i18n";
  import "./styles/index.css";

  createRoot(document.getElementById("root")!).render(
    <LangProvider>
      <AppRouter />
    </LangProvider>
  );
