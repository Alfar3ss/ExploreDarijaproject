"use client";
import './globals.css'
import React, { useEffect, useState } from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import { LanguageProvider } from '../components/language-provider'
import Spinner from '../components/spinner'
import { usePathname } from 'next/navigation'
import { SpeedInsights } from "@vercel/speed-insights/next"


export default function RootLayout({ children }: { children: React.ReactNode }) {
	const [loading, setLoading] = useState(false);
	const pathname = usePathname();

	useEffect(() => {
		setLoading(true);
		const timeout = setTimeout(() => setLoading(false), 600); 
		return () => clearTimeout(timeout);
	}, [pathname]);

	return (
		<html lang="en">
			<body className={loading ? 'overflow-hidden' : ''}>
				{loading && <Spinner />}
				<LanguageProvider>
					<React.Suspense fallback={null}>
						<Header />
					</React.Suspense>
					<div className={loading ? 'pointer-events-none select-none blur-sm transition-all duration-300' : 'transition-all duration-300'}>
						{children}
						<React.Suspense fallback={null}>
							<Footer />
						</React.Suspense>
					</div>
				</LanguageProvider>
			</body>
		</html>
	);
}

