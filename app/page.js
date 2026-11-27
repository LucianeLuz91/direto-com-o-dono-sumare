'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function HomePage() {
  const [anuncios, setAnuncios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    async function carregarAnuncios() {
      const { data, error } = await supabase
        .from('anuncios')
        .select('*');

      if (error) {
        setErro('Não foi possível carregar os anúncios agora.');
      } else {
        setAnuncios(data || []);
      }
      setCarregando(false);
    }

    carregarAnuncios();
  }, []);

  function montarLinkWhatsApp(anuncio) {
    const telefoneBruto =
      anuncio.whatsapp || anuncio.telefone || anuncio.contato || '';
    const digitos = String(telefoneBruto).replace(/\D/g, '');
    const numeroComPais = digitos.startsWith('55') ? digitos : `55${digitos}`;
    const titulo = anuncio.titulo || anuncio.nome || 'o anúncio';
    const texto = encodeURIComponent(
      `Olá! Vi "${titulo}" no Direto com o Dono Sumaré e gostaria de falar direto com você.`
    );
    return `https://wa.me/${numeroComPais}?text=${texto}`;
  }

  return (
    <main>
      <h1>Direto com o Dono Sumaré</h1>
      <p>Imóveis e veículos direto com o proprietário em Sumaré/SP.</p>

      {carregando && <p>Carregando anúncios...</p>}
      {erro && <p>{erro}</p>}

      {!carregando && !erro && anuncios.length === 0 && (
        <p>Nenhum anúncio publicado ainda na tabela anuncios.</p>
      )}

      <div style={{ display: 'grid', gap: '16px', marginTop: '20px' }}>
        {anuncios.map((item, index) => {
          const titulo = item.titulo || item.nome || `Anúncio #${item.id ?? index + 1}`;
          const valor = item.preco ?? item.valor;
          const fotoUrl = item.foto_url || item.imagem_url || item.foto;
          const temTelefone = Boolean(
            String(item.whatsapp || item.telefone || item.contato || '').replace(/\D/g, '')
          );

          return (
            <article
              key={item.id ?? index}
              style={{
                border: '1px solid #d4d4d8',
                borderRadius: '10px',
                padding: '16px',
              }}
            >
              {fotoUrl && (
                <img
                  src={fotoUrl}
                  alt={titulo}
                  style={{
                    width: '100%',
                    maxHeight: '260px',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    marginBottom: '12px',
                  }}
                />
              )}
              <h2 style={{ marginTop: 0 }}>{titulo}</h2>
              {valor !== undefined && valor !== null && (
                <p><strong>Valor:</strong> {valor}</p>
              )}
              {item.descricao && <p>{item.descricao}</p>}
              {temTelefone && (
                <a
                  href={montarLinkWhatsApp(item)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    marginTop: '8px',
                    padding: '10px 16px',
                    backgroundColor: '#16a34a',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                  }}
                >
                  Falar no WhatsApp com o dono
                </a>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
