import localFont from "next/font/local";
import "./globals.css";
// 1. import `NextUIProvider` component
import { NextUIProvider } from "@nextui-org/react";
import SideBar from "./components/SideBar";
import DynamicHeader from './components/DynamicHeader';
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata = {
  title: "ESG DART KOREA",
  description: "ESG 목표를 확인해보세요",
};




export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-full`}
      >
        <NextUIProvider>
          <SideBar children={children} header={<DynamicHeader/>}/>
          
        </NextUIProvider>
      </body>
    </html>
  );
}
