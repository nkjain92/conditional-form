'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (isSignIn) {
        await signIn(email, password);
      } else {
        await signUp(email, password);
      }
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
    }
  };

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
      <div className='bg-[#1A1A1A] p-8 rounded-2xl w-full max-w-md border border-white/10'>
        <h2 className='text-2xl font-bold mb-6 text-center bg-gradient-to-r from-white to-white/60 text-transparent bg-clip-text'>
          {isSignIn ? 'Sign In' : 'Create Account'}
        </h2>

        <form onSubmit={handleSubmit} className='space-y-4'>
          <div>
            <label htmlFor='email' className='block text-sm font-medium text-white/80 mb-1'>
              Email
            </label>
            <input
              type='email'
              id='email'
              value={email}
              onChange={e => setEmail(e.target.value)}
              className='block w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all'
              required
            />
          </div>

          <div>
            <label htmlFor='password' className='block text-sm font-medium text-white/80 mb-1'>
              Password
            </label>
            <input
              type='password'
              id='password'
              value={password}
              onChange={e => setPassword(e.target.value)}
              className='block w-full rounded-xl border border-white/10 px-4 py-3 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all'
              required
            />
          </div>

          {error && (
            <div className='text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-xl'>
              {error}
            </div>
          )}

          <button
            type='submit'
            className='w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-4 py-3 hover:from-blue-600 hover:to-blue-700 transition-all font-medium'>
            {isSignIn ? 'Sign In' : 'Create Account'}
          </button>

          <button
            type='button'
            onClick={() => setIsSignIn(!isSignIn)}
            className='w-full text-white/60 hover:text-white text-sm transition-colors'>
            {isSignIn ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </form>

        <button
          onClick={onClose}
          className='absolute top-4 right-4 text-white/60 hover:text-white transition-colors'
          aria-label='Close modal'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-6 w-6'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
            aria-hidden='true'>
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
