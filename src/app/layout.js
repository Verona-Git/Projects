import "./globals.css";

export const metadata = {
  title: "Autovalet CRM",
  description: "Project enquiry and active project management"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
