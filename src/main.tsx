// main.tsx
import React from "react";
import ReactDOM from "react-dom/client";
import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import App from "./App";
import "../src/styles/index.css";
import "./i18n/config";

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <HeroUIProvider>
            <NextThemesProvider attribute="class" defaultTheme="dark">
                <main className="dark text-foreground bg-background min-h-screen">
                    <App />
                </main>
            </NextThemesProvider>
        </HeroUIProvider>
    </React.StrictMode>,
);