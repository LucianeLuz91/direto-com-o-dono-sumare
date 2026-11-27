export const metadata = {
  title: 'Direto com o Dono Sumaré',
  description: 'Imóveis e veículos negociados direto com o proprietário em Sumaré/SP.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ fontFamily: 'sans-serif', margin: 0, padding: '20px', maxWidth: '720px', marginInline: 'auto' }}>
        {children}
      </body>
    </html>
  );
}
