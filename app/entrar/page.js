'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export default function Entrar() {
  const router = useRouter();
  const [modoCadastro, setModoCadastro] = useState(false);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [nome, setNome] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [cpf, setCpf] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [mensagem, setMensagem] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setCarregando(true);
    setMensagem(null);

    if (modoCadastro) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password: senha,
      });

      if (error) {
        setMensagem({ tipo: 'erro', texto: error.message });
        setCarregando(false);
        return;
      }

      if (data?.user) {
        await supabase.from('perfis').insert({
          id: data.user.id,
          nome_completo: nome,
          whatsapp: whatsapp.replace(/\D/g, ''),
          cpf: cpf.replace(/\D/g, ''),
          plano: 'gratis',
          verificado: false,
        });
      }

      setMensagem({
        tipo: 'sucesso',
        texto: 'Conta criada! Verifique seu e-mail se solicitado ou faça login para acessar seu painel.',
      });
      setModoCadastro(false);
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: senha,
      });

      if (error) {
        setMensagem({ tipo: 'erro', texto: 'E-mail ou senha inválidos.' });
      } else {
        router.push('/painel');
      }
    }

    setCarregando(false);
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center px-4 py-12">
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <span className="bg-emerald-600 text-white font-extrabold px-2.5 py-1 rounded-lg text-sm">
              DD
            </span>
            <span className="font-extrabold text-lg text-slate-900">Direto com o Dono</span>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">
            {modoCadastro ? 'Criar conta de proprietário' : 'Acessar minha conta'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {modoCadastro
              ? 'Cadastre-se gratuitamente para anunciar imóveis e veículos em Sumaré'
              : 'Entre para gerenciar seus anúncios e verificar sua identidade'}
          </p>
        </div>

        {mensagem && (
          <div
            className={`p-3.5 rounded-xl text-xs font-medium mb-4 ${
              mensagem.tipo === 'erro'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {mensagem.texto}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {modoCadastro && (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp (com DDD)
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="19999999999"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    CPF
                  </label>
                  <input
                    type="text"
                    required
                    value={cpf}
                    onChange={(e) => setCpf(e.target.value)}
                    placeholder="000.000.000-00"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">E-mail</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seuemail@exemplo.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Senha</label>
            <input
              type="password"
              required
              minLength={6}
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-emerald-600"
            />
          </div>

          <button
            type="submit"
            disabled={carregando}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-sm shadow-sm transition disabled:opacity-50"
          >
            {carregando
              ? 'Processando...'
              : modoCadastro
              ? 'Criar Minha Conta Grátis'
              : 'Entrar no Painel'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setModoCadastro(!modoCadastro);
              setMensagem(null);
            }}
            className="text-xs font-semibold text-emerald-700 hover:underline"
          >
            {modoCadastro
              ? 'Já tem uma conta? Faça login aqui'
              : 'Ainda não tem conta? Cadastre-se grátis'}
          </button>
        </div>
      </div>
    </div>
  );
}
