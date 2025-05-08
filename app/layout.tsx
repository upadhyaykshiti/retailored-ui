'use client';
import { LayoutProvider } from '../layout/context/layoutcontext';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/primereact.css';
import 'primeflex/primeflex.css';
import 'primeicons/primeicons.css';
import '../styles/layout/layout.scss';
import '../styles/demo/Demos.scss';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

interface RootLayoutProps {
    children: React.ReactNode;
}

function ViewportEnforcer() {
    const pathname = usePathname();

    useEffect(() => {
        const meta = document.querySelector('meta[name="viewport"]');
        if (meta) {
            meta.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }

        document.documentElement.style.webkitUserSelect = 'none';
    }, [pathname]);

    return null;
}

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <meta 
                    name="viewport" 
                    content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, shrink-to-fit=no" 
                />
                <link id="theme-css" href={`/themes/lara-light-indigo/theme.css`} rel="stylesheet"></link>
                <style>
                    {`
                        html {
                            -webkit-text-size-adjust: 100%;
                            text-size-adjust: 100%;
                            touch-action: manipulation;
                            -webkit-user-scalable: none;
                            overscroll-behavior: contain;
                        }
                        body {
                            touch-action: pan-y;
                            overscroll-behavior-y: contain;
                        }
                        * {
                            -webkit-user-select: none;
                            user-select: none;
                        }
                        input, textarea, [contenteditable] {
                            -webkit-user-select: text;
                            user-select: text;
                        }
                    `}
                </style>
            </head>
            <body>
                <PrimeReactProvider>
                    <LayoutProvider>
                        <ViewportEnforcer />
                        {children}
                    </LayoutProvider>
                </PrimeReactProvider>
                <script dangerouslySetInnerHTML={{
                    __html: `
                    document.addEventListener('gesturestart', function(e) {
                        e.preventDefault();
                    });
                    `
                }} />
            </body>
        </html>
    );
}