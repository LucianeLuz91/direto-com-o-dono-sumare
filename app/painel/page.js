'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function Painel() {
  const router = useRouter();
  const [usuario, setUsuario] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [meusAnuncios, setMeusAnuncios] = useState([]);
  const [carregando, setCarregando] = useState(true);

  // Formulário de novo anúncio
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState('Imóvel');
  const [bairro, setBairro] = useState('');
  const [preco, setPreco] = useState('');
  const [descricao, setDescricao] = useState('');
  const [fotoAnuncio, setFotoAnuncio] = useState(null);
  const [enviandoAnuncio, setEnviandoAnuncio] = useState(false);

  // Upload de documento
  const [docIdentidade, setDocIdentidade] = useState(null);
  const [enviandoDoc, setEnviandoDoc] = useState(false);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData?.user) {
      router.push('/entrar');
      return;
    }

    const user = authData.user;
    setUsuario(user);

    const { data: perfilData } = await supabase
      .from('perfis')
      .select('*')
      .eq('id', user.id)
      .single();

    setPerfil(perfilData || { plano: 'gratis', verificado: false });

    const { data: anunciosData } = await supabase
      .from('anuncio')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    setMeusAnuncios(anunciosData || []);
    setCarregando(false);
  }

  async function enviarDocumento(e) {
    e.preventDefault();
    if (!docIdentidade || !usuario) return;
    setEnviandoDoc(true);

    const extensao = docIdentidade.name.split('.').pop();
    const caminho = `${usuario.id}/documento.${extensao}`;

    const { error: uploadError } = await supabase.storage
      .from('documentos')
      .upload(caminho, docIdentidade, { upsert: true });

    if (!uploadError) {
      await supabase
        .from('perfis')
        .update({ documento_url: caminho })
        .eq('id', usuario.id);
      alert('Documento enviado com sucesso! A nossa equipa vai validar e libertar o selo em breve.');
      carregarDados();
    } else {
      alert('Erro ao enviar documento: ' + uploadError.message);
    }
    setEnviandoDoc(false);
  }

  async function criarAnuncio(e) {
    e.preventDefault();
    if (!usuario) return;

    const ehPro = perfil?.plano === 'pro';
    if (!ehPro && meusAnuncios.length >= 1) {
      alert('No Plano Gratuito podes ter até 1 anúncio ativo. Faz upgrade para o Plano Pro para anúncios ilimitados!');
      return;
    }

    setEnviandoAnuncio(true);
    let urlPublica = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80';

    if (fotoAnuncio) {
      const ext = fotoAnuncio.name.split('.').pop();
      const nomeArquivo = `${usuario.id}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('fotos-anuncios')
        .upload(nomeArquivo, fotoAnuncio);

      if (!upErr) {
        const { data: pubData } = supabase.storage
          .from('fotos-anuncios')
          .getPublicUrl(nomeArquivo);
        urlPublica = pubData.publicUrl;
      }
    }

    const { error } = await supabase.from('anuncio').insert({
      user_id: usuario.id,
      titulo,
      categoria,
      bairro: bairro || 'Sumaré/SP',
      preco,
      descricao,
      whatsapp: perfil?.whatsapp ? `55${perfil.whatsapp}` : '5519999999999',
      imagem_url: urlPublica,
      destaque: ehPro,
    });

    if (error) {
      alert('Erro ao publicar: ' + error.message);
    } else {
      setTitulo('');
      setBairro('');
      setPreco('');
      setDescricao('');
      setFotoAnuncio(null);
      carregarDados();
    }
    setEnviandoAnuncio(false);
  }

  async function excluirAnuncio(id) {
    if (!confirm('Desejas mesmo remover este anúncio?')) return;
    await supabase.from('anuncio').delete().eq('id', id);
    carregarDados();
  }

  async function sair() {
    await supabase.auth.signOut();
    router.push('/');
  }

  if (carregando) {
    return <div className="min-h-screen flex items-center justify-center text-slate-500">A carregar painel...</div>;
  }

  const ehPro = perfil?.plano === 'pro';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b border-slate-200 px-4 py-3.5">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="font-extrabold text-emerald-700 text-base">
            ← Voltar para a Vitrine
          </Link>
          <button onClick={sair} className="text-xs font-semibold text-red-600 hover:underline">
            Terminar sessão
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Estado da Conta e Plano */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Cartão Verificação de Identidade */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-base">🛡️ Verificação de Identidade</h2>
              <span
                className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                  perfil?.verificado
                    ? 'bg-emerald-100 text-emerald-800'
                    : perfil?.documento_url
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {perfil?.verificado
                  ? '✅ Verificado'
                  : perfil?.documento_url
                  ? '⏳ Em análise'
                  : 'Pendente'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mb-4">
              Envia uma fotografia legível do teu documento de identificação para ganhares o selo <strong>Dono Verificado</strong> e passares mais confiança aos compradores.
            </p>
            {!perfil?.verificado && (
              <form onSubmit={enviarDocumento} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  required
                  onChange={(e) => setDocIdentidade(e.target.files[0])}
                  className="text-xs text-slate-600 flex-1"
                />
                <button
                  type="submit"
                  disabled={enviandoDoc}
                  className="bg-slate-900 text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-slate-800"
                >
                  {enviandoDoc ? 'A enviar...' : 'Enviar Documento'}
                </button>
              </form>
            )}
          </div>

          {/* Cartão Plano Atual */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="font-bold text-base">💎 O Teu Plano</h2>
                <span className="text-xs font-extrabold uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {ehPro ? 'Plano Pro Ilimitado' : 'Plano Gratuito (1 anúncio)'}
                </span>
              </div>
              <p className="text-xs text-slate-600">
                {ehPro
                  ? 'Tens anúncios ilimitados e destaque no topo das pesquisas em Sumaré.'
                  : `Utilizaste ${meusAnuncios.length} de 1 anúncio gratuito disponível.`}
              </p>
            </div>

            {!ehPro && (
              <a
                href="https://wa.me/5519999999999?text=Ol%C3%A1!%20Quero%20ativar%20o%20Plano%20Pro%20no%20Direto%20com%20o%20Dono%20Sumar%C3%A9."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-block text-center bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs py-2.5 px-4 rounded-xl shadow-sm transition"
              >
                ⭐ Fazer Upgrade para Plano Pro (Anúncios Ilimitados + Destaque)
              </a>
            )}
          </div>
        </div>

        {/* Formulário Novo Anúncio */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="font-bold text-lg mb-4">Publicar Novo Anúncio</h2>
          <form onSubmit={criarAnuncio} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Título do Anúncio</label>
              <input
                type="text"
                required
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Casa 3 dormitórios no Nova Veneza ou Honda Civic 2020"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Categoria</label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white"
              >
                <option value="Imóvel">Imóvel</option>
                <option value="Veículo">Veículo</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bairro em Sumaré</label>
              <input
                type="text"
                required
                value={bairro}
                onChange={(e) => setBairro(e.target.value)}
                placeholder="Ex: Centro, Matão, Nova Veneza"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Valor</label>
              <input
                type="text"
                required
                value={preco}
                onChange={(e) => setPreco(e.target.value)}
                placeholder="Ex: R$ 350.000 ou R$ 68.000"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Fotografia Principal</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFotoAnuncio(e.target.files[0])}
                className="w-full text-xs text-slate-600 pt-1.5"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Descrição Detalhada</label>
              <textarea
                rows={3}
                required
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreve os detalhes do imóvel ou veículo, estado de conservação, documentação..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={enviandoAnuncio}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 py-3 rounded-xl shadow-sm transition"
              >
                {enviandoAnuncio ? 'A publicar...' : 'Publicar Anúncio Agora'}
              </button>
            </div>
          </form>
        </section>

        {/* Os Meus Anúncios Ativos */}
        <section>
          <h2 className="font-bold text-lg mb-4">Os Meus Anúncios ({meusAnuncios.length})</h2>
          {meusAnuncios.length === 0 ? (
            <p className="text-sm text-slate-500 bg-white p-6 rounded-2xl border border-slate-200">
              Ainda não publicaste nenhum anúncio.
            </p>
          ) : (
            <div className="space-y-3">
              {meusAnuncios.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center justify-between gap-4"
                >
                  <div>
                    <span className="text-xs font-bold text-emerald-700">{item.categoria}</span>
                    <h3 className="font-bold text-slate-900">{item.titulo}</h3>
                    <p className="text-xs text-slate-500">
                      {item.bairro} • <strong>{item.preco}</strong>
                    </p>
                  </div>
                  <button
                    onClick={() => excluirAnuncio(item.id)}
                    className="text-xs font-semibold text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg border border-red-200"
                  >
                    Excluir
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
