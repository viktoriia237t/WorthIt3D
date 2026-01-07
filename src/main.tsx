// main.tsx
import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import App from "./App";
import "../src/styles/index.css";
import "./i18n/config";
import { registerServiceWorker } from "./utils/sw-registration";
import { UpdateNotification } from "./components/UpdateNotification";

function Root() {
    const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        // Only register service worker in production
        if (import.meta.env.PROD) {
            registerServiceWorker((event) => {
                console.log('[App] Service worker event:', event.type);

                // Update registration state when update is available
                if (event.type === 'update-available') {
                    navigator.serviceWorker.getRegistration().then((reg) => {
                        if (reg) {
                            setSwRegistration(reg);
                        }
                    });
                }
            }).then((registration) => {
                if (registration) {
                    setSwRegistration(registration);
                }
            });
        }
    }, []);

    return (
        <React.StrictMode>
            <HeroUIProvider>
                <NextThemesProvider attribute="class" defaultTheme="dark">
                    <main className="dark text-foreground bg-background min-h-screen">
                        <App />
                        <UpdateNotification registration={swRegistration} />
                    </main>
                </NextThemesProvider>
            </HeroUIProvider>
        </React.StrictMode>
    );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<Root />);