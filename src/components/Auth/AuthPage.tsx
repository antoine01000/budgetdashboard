import React, { useState } from 'react';
import useAppStore from '../../store';

export const AuthPage: React.FC = () => {
  const [showRegister, setShowRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signUp, signIn, loadUserData } = useAppStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (showRegister) {
        if (password !== confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas.');
        }
        await signUp(email, password);
        await loadUserData();
      } else {
        await signIn(email, password);
        await loadUserData();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-orange-400 to-orange-600 text-white text-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md p-8">
        <h1 className="text-3xl font-bold mb-8">
          {showRegister ? 'Créer un compte' : 'Connexion'}
        </h1>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Adresse email"
            className="w-full p-3 rounded bg-orange-500 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-orange-500 appearance-none [-webkit-appearance:none] [-moz-appearance:none] [&:autofill]:bg-orange-500 [&:autofill]:text-white [&:-webkit-autofill]:bg-orange-500 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_30px_rgb(249_115_22)_inset]"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
            required
          />

          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full p-3 rounded bg-orange-500 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none [-webkit-appearance:none] [-moz-appearance:none] [&:autofill]:bg-orange-500 [&:autofill]:text-white [&:-webkit-autofill]:bg-orange-500 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_30px_rgb(249_115_22)_inset]"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {showRegister && (
            <input
              type="password"
              placeholder="Confirmer le mot de passe"
              className="w-full p-3 rounded bg-orange-500 border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 appearance-none [-webkit-appearance:none] [-moz-appearance:none] [&:autofill]:bg-orange-500 [&:autofill]:text-white [&:-webkit-autofill]:bg-orange-500 [&:-webkit-autofill]:text-white [&:-webkit-autofill]:[-webkit-text-fill-color:white] [&:-webkit-autofill]:[-webkit-box-shadow:0_0_0_30px_rgb(249_115_22)_inset]"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          )}
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded text-white">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="w-full mt-6 p-3 bg-white text-orange-500 rounded font-semibold hover:bg-orange-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          {isLoading
            ? 'Chargement...'
            : showRegister
            ? "S'inscrire"
            : 'Se connecter'}
        </button>

        <button
          type="button"
          className="mt-4 text-white/80 hover:text-white transition-colors"
          onClick={() => {
            setShowRegister(!showRegister);
            setError('');
          }}
        >
          {showRegister
            ? 'Déjà un compte ? Se connecter'
            : "Pas encore de compte ? S'inscrire"}
        </button>
      </form>
    </div>
  );
};