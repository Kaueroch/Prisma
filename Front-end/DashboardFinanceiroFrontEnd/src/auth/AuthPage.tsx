/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wallet, Mail, Lock, User, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from './AuthContext';

type AuthMode = 'login' | 'register';

export function AuthPage() {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setError('');
    setSuccess('');
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await login(email.trim(), password);
      
      if (!success) {
        setError('E-mail ou senha incorretos.');
      }
    } catch (err) {
      setError('Ocorreu um erro de conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const success = await register(name.trim(), email.trim(), password);
      
      if (!success) {
        setError('Este e-mail já está em uso.');
      }
    } catch (err) {
      setError('Ocorreu um erro de conexão.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-glass-grid relative">
      <div className="bg-orb-1" style={{ top: '-20%', right: '-15%' }} />
      <div className="bg-orb-3" style={{ top: '50%', left: '60%' }} />
      <div className="w-full max-w-md">
        {/* Logo / Brand */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-white text-black flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight text-white">Prisma</span>
        </div>

        {/* Auth Card */}
        <motion.div
          layout
          className="glass-modal rounded-2xl shadow-2xl shadow-black/30 overflow-hidden"
        >
          {/* Header */}
          <div className="p-8 pb-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={mode}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.2 }}
              >
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  {mode === 'login' ? 'Entrar' : 'Criar Conta'}
                </h1>
                <p className="text-white/40 text-sm mt-1.5">
                  {mode === 'login'
                    ? 'Acesse seu painel financeiro.'
                    : 'Comece a organizar suas finanças.'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Error / Success Messages */}
          <AnimatePresence>
            {(error || success) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="px-8 pt-6 overflow-hidden"
              >
                <div
                  className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-medium ${
                    error
                      ? 'bg-red-500/10 text-red-400 border border-red-500/20 backdrop-blur-sm'
                      : 'bg-green-500/10 text-green-400 border border-green-500/20 backdrop-blur-sm'
                  }`}
                >
                  {error ? (
                    <AlertCircle className="w-4 h-4 shrink-0" />
                  ) : (
                    <CheckCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{error || success}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form
            onSubmit={mode === 'login' ? handleLogin : handleRegister}
            className="p-8 flex flex-col gap-5"
          >
            {/* Name (Register only) */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="flex flex-col gap-2 overflow-hidden"
                >                    <label className="text-sm font-medium text-white/40">Nome</label>
                  <div className="relative">
                    <User className="w-5 h-5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full glass-input rounded-xl py-3.5 pl-12 pr-4 text-base text-white outline-none placeholder:text-white/30"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/40">E-mail</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="seu@email.com.br"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full glass-input rounded-xl py-3.5 pl-12 pr-4 text-base text-white outline-none placeholder:text-white/30 transition-glass"
                />
              </div>
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-white/40">Senha</label>
              <div className="relative">
                <Lock className="w-5 h-5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full glass-input rounded-xl py-3.5 pl-12 pr-12 text-base text-white outline-none placeholder:text-white/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-glass cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password (Register only) */}
            <AnimatePresence>
              {mode === 'register' && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: 'easeInOut' }}
                  className="flex flex-col gap-2 overflow-hidden"
                >
                  <label className="text-sm font-medium text-white/40">Confirmar Senha</label>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-white/30 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Repita sua senha"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full glass-input rounded-xl py-3.5 pl-12 pr-12 text-base text-white outline-none placeholder:text-white/30 transition-glass"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-2 w-full bg-white hover:bg-white/90 disabled:bg-white/10 disabled:text-white/30 text-black font-semibold text-lg py-4 rounded-xl transition-glass flex items-center justify-center gap-2 glow-primary cursor-pointer disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  Entrar
                  <ArrowRight className="w-5 h-5" strokeWidth={2.5} />
                </>
              ) : (
                'Criar Conta'
              )}
            </button>
          </form>

          {/* Toggle Mode */}
          <div className="px-8 pb-8">
            <p className="text-center text-sm text-white/40">
              {mode === 'login' ? 'Ainda não tem uma conta?' : 'Já tem uma conta?'}{' '}
              <button
                type="button"
                onClick={switchMode}
                className="text-white font-medium hover:text-white/70 transition-glass cursor-pointer"
              >
                {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
              </button>
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs mt-8">
          Ao continuar, você concorda com nossos Termos de Uso e Política de Privacidade.
        </p>
      </div>
    </div>
  );
}
