import type { Metadata } from "next";
import { Inter, Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { Providers } from "../components/Providers";

const inter = Inter({
    variable: "--font-inter",
    subsets: ["latin", "vietnamese"],
    display: "swap",
});

const beVietnamPro = Be_Vietnam_Pro({
    variable: "--font-be-vietnam-pro",
    weight: ["400", "500", "600", "700", "800", "900"],
    subsets: ["latin", "vietnamese"],
    display: "swap",
});

export const metadata: Metadata = {
    title: "TroHCM - Tìm Trọ Sinh Viên TP.HCM",
    description:
        "TroHCM là hệ thống hỗ trợ sinh viên tìm kiếm phòng trọ, căn hộ dịch vụ và ở ghép gần các trường đại học tại TP. Hồ Chí Minh. Uy tín, chính xác và tiện lợi.",
    keywords: "phòng trọ sinh viên, tìm trọ hcm, nhà trọ đại học, trọ gần trường, tp hồ chí minh",
    openGraph: {
        title: "TroHCM - Tìm Trọ Sinh Viên TP.HCM",
        description: "Tìm phòng trọ gần trường đại học tại TP.HCM nhanh chóng, uy tín.",
        type: "website",
        locale: "vi_VN",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="vi"
            className={`${inter.variable} ${beVietnamPro.variable} h-full antialiased`}
        >
            <body className="min-h-full flex flex-col font-sans">
                <Providers>
                    <AuthProvider>{children}</AuthProvider>
                </Providers>
            </body>
        </html>
    );
}
