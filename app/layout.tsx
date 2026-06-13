// Root layout — minimal shell required by Next.js.
// All actual layout (fonts, dir, lang) is handled in app/[locale]/layout.tsx
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
