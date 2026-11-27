'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export default function Home() {
  const [anuncios, setAnuncios] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [filtroCategoria, setFiltroCategoria] = useState('Todos');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    async function carregarAnuncios() {
      if (!supabase) {
        setErro('Variáveis de ambiente do Supabase não configuradas na Vercel.');
        setCarregando(false);
        return;
      }

      setCarregando(true);
      const { data, error } = await supabase
        .from('anuncio')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro Supabase:', error);
        setErro(error.message);
      } else {
        setAnuncios(data || []);
      }
      setCarregando(false);
    }

    carregarAnuncios();
  }, []);

  const anunciosFiltrados = anuncios.filter((item) => {
    const bateCategoria =
      filtroCategoria === 'Todos' ||
      (item.categoria || '').toLowerCase() === filtroCategoria.toLowerCase();
    const termo = busca.toLowerCase();
    const bateBusca =
      (item.titulo || '').toLowerCase().includes(termo) ||
      (item.bairro || '').toLowerCase().includes(termo) ||
      (item.descricao || item.desc || '').toLowerCase().includes(termo);
    return bateCategoria && bateBusca;
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Barra Superior */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="bg-emerald-600 text-white font-extrabold px-2.5 py-1 rounded-lg text-sm shadow-sm">
              DD
            </span>
            <div>
              <h1 className="font-extrabold text-lg leading-tight text-slate-900">
                Direto com o Dono
              </h1>
              <p className="text-xs text-emerald-700 font-semibold">Sumaré / SP</p>
            </div>
          </div>

          <a
            href="https://wa.me/5519999999999?text=Ol%C3%A1!%20Quero%20anunciar%20no%20Direto%20com%20o%20Dono%20Sumar%C3%A9."
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-4 py-2 rounded-full shadow-sm transition"
          >
            + Anunciar Grátis
          </a>
        </div>
      </header>

      {/* Banner Principal e Filtros */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            Zero comissão • Negociação transparente em Sumaré
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Imóveis e veículos direto com o proprietário
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto mb-7">
            Encontre casas, apartamentos, terrenos, carros e motos em Sumaré/SP e fale diretamente com quem está vendendo.
          </p>

          {/* Barra de Pesquisa e Categorias */}
          <div className="bg-white p-2 rounded-2xl shadow-lg max-w-2xl mx-auto flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Buscar por bairro (ex: Nova Veneza, Matão) ou modelo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="flex-1 px-4 py-2.5 text-slate-800 text-sm rounded-xl focus:outline-none"
            />
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl justify-center">
              {['Todos', 'Imóvel', 'Veículo'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFiltroCategoria(cat)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                    filtroCategoria === cat
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat === 'Todos' ? 'Todos' : cat === 'Imóvel' ? 'Imóveis' : 'Veículos'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vantagens Rápidas */}
      <section className="bg-white border-b border-slate-200/80 py-4 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-3 text-center text-xs font-medium text-slate-600">
          <div>✅ Sem intermediários ou taxas extras</div>
          <div>💬 Contato direto no WhatsApp do dono</div>
          <div>📍 Foco 100% em Sumaré e região</div>
        </div>
      </section>

      {/* Listagem de Anúncios */}
      <main className="max-w-6xl mx-auto px-4 py-10 flex-1 w-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800">
            Destaques em Sumaré
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {anunciosFiltrados.length}{' '}
            {anunciosFiltrados.length === 1 ? 'anúncio encontrado' : 'anúncios encontrados'}
          </span>
        </div>

        {carregando ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : erro ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-2xl p-6 text-center">
            <p className="font-semibold">Não foi possível carregar os anúncios agora.</p>
            <p className="text-xs mt-1 text-red-600">Detalhe técnico: {erro}</p>
          </div>
        ) : anunciosFiltrados.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-500">
            Nenhum anúncio encontrado com esse filtro.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {anunciosFiltrados.map((item) => {
              const textoDesc = item.descricao || item.desc || 'Entre em contato para mais detalhes.';
              const numeroZap = (item.whatsapp || '5519999999999').replace(/\D/g, '');
              const msgZap = encodeURIComponent(
                `Olá! Vi seu anúncio "${item.titulo}" no Direto com o Dono Sumaré e tenho interesse.`
              );

              return (
                <article
                  key={item.id}
                  className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col"
                >
                  <div className="relative h-48 bg-slate-200">
                    <img
                      src={
                        item.imagem_url ||
                        'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80'
                      }
                      alt={item.titulo}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {item.categoria || 'Destaque'}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-xs text-slate-500 font-medium mb-1">
                      📍 {item.bairro || 'Sumaré/SP'}
                    </p>
                    <h4 className="font-bold text-lg text-slate-900 leading-snug mb-2">
                      {item.titulo}
                    </h4>
                    <p className="text-sm text-slate-600 line-clamp-2 mb-4 flex-1">
                      {textoDesc}
                    </p>

                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 block">
                          Valor
                        </span>
                        <span className="text-lg font-extrabold text-emerald-700">
                          {item.preco || 'A combinar'}
                        </span>
                      </div>

                      <a
                        href={`https://wa.me/${numeroZap}?text=${msgZap}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow-sm"
                      >
                        Chamar no WhatsApp
                      </a>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>

      {/* Rodapé */}
      <footer className="bg-white border-t border-slate-200 py-6 px-4 text-center text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Direto com o Dono Sumaré</p>
        <p className="mt-1">
          Plataforma de classificados locais em Sumaré/SP. Negocie sempre diretamente com o proprietário.
        </p>
      </footer>
    </div>
  );
}
