import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
});

export const metadata = {
  title: "PulseFit - Today's Workout",
  description: "Modern workout tracker UI",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${jakarta.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
