import "@/styles/globals.css";

import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Toaster } from "sonner";

export const metadata: Metadata = {
	title: "AI 标题和标签生成器",
	description: "基于 AI 的智能标题和标签生成工具，支持多语言和自定义配置",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

const geist = Geist({
	subsets: ["latin"],
	variable: "--font-geist-sans",
});

export default function RootLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	return (
		<html lang="zh-CN" className={`${geist.variable}`}>
			<body>
				{children}
				<Toaster position="top-center" richColors />
			</body>
		</html>
	);
}
