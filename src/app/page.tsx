'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth';
import AuthModal from '@/components/AuthModal';

interface Theme {
  id: string;
  name: string;
  maxVotes: number;
  _count: {
    votes: number;
  };
}

// Default themes for optimistic UI
const defaultThemes: Theme[] = [
  { id: 'default-italian', name: 'Italian', maxVotes: 100, _count: { votes: 0 } },
  { id: 'default-mexican', name: 'Mexican', maxVotes: 100, _count: { votes: 0 } },
  { id: 'default-chinese', name: 'Chinese', maxVotes: 100, _count: { votes: 0 } },
  { id: 'default-indian', name: 'Indian', maxVotes: 100, _count: { votes: 0 } },
  { id: 'default-mediterranean', name: 'Mediterranean', maxVotes: 100, _count: { votes: 0 } },
];

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [themes, setThemes] = useState<Theme[]>(defaultThemes);
  const [voterName, setVoterName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

  const handleCreateForm = () => {
    if (user) {
      router.push('/dashboard');
    } else {
      setIsAuthModalOpen(true);
      sessionStorage.setItem('redirectAfterAuth', '/dashboard');
    }
  };

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      const response = await fetch('/api/themes');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch themes');
      }

      if (Array.isArray(data)) {
        setThemes(data);
      } else if (data.error) {
        setError(data.error);
      } else {
        setError('Invalid data format received');
      }
    } catch (error) {
      console.error('Error fetching themes:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch themes');
    }
  };

  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!voterName || !selectedTheme) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setSuccess('Submitting your vote...');

      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          themeId: selectedTheme,
          voterName: voterName.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit vote');
      }

      setSuccess('Vote submitted successfully!');
      setVoterName('');
      setSelectedTheme('');
      setHasVoted(true);
      await fetchThemes(); // Refresh themes after successful vote
    } catch (error) {
      console.error('Vote error:', error);
      setError(error instanceof Error ? error.message : 'Failed to submit vote');
      setHasVoted(false);
    }
  };

  const availableThemes = themes.filter(theme => theme._count.votes < theme.maxVotes);

  return (
    <>
      <main className='min-h-screen p-8 bg-[#0A0A0A] text-white'>
        <div className='max-w-2xl mx-auto'>
          <div className='flex justify-between items-center mb-8'>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-white to-white/60 text-transparent bg-clip-text whitespace-nowrap'>
              Catering Theme Voting
            </h1>
            <button
              onClick={handleCreateForm}
              className='bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-2.5 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-medium whitespace-nowrap min-w-[200px]'>
              Create Your Form
            </button>
          </div>

          <p className='text-lg text-center mb-6 text-white/60'>
            Choose your preferred catering theme for the event
          </p>

          <form
            onSubmit={handleVote}
            className='space-y-4 bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10 mb-6'>
            <div>
              <label htmlFor='voterName' className='block text-sm font-medium text-white/80 mb-1'>
                Your Name
              </label>
              <input
                type='text'
                id='voterName'
                value={voterName}
                onChange={e => setVoterName(e.target.value)}
                className='block w-full rounded-xl border border-white/10 px-4 py-2 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all'
                required
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-white/80 mb-2'>Select Theme</label>
              <div className='space-y-2'>
                {availableThemes.map(theme => (
                  <label
                    key={theme.id}
                    className='flex items-center p-3 border border-white/10 rounded-xl hover:bg-white/5 cursor-pointer transition-all group'>
                    <input
                      type='radio'
                      name='theme'
                      value={theme.id}
                      checked={selectedTheme === theme.id}
                      onChange={e => setSelectedTheme(e.target.value)}
                      className='h-4 w-4 text-blue-500 focus:ring-blue-500/50 border-white/20 bg-white/5'
                      required
                    />
                    <span className='ml-3 group-hover:text-white/90 transition-colors'>
                      {theme.name}
                    </span>
                    <span className='ml-auto text-sm text-white/40 group-hover:text-white/60 transition-colors'>
                      {theme.maxVotes - theme._count.votes} spots left
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className='text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-3 rounded-xl'>
                {error}
              </div>
            )}
            {success && !error && (
              <div className='text-green-400 text-sm bg-green-500/10 border border-green-500/20 p-3 rounded-xl'>
                {success}
              </div>
            )}

            <button
              type='submit'
              disabled={availableThemes.length === 0}
              className='w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-4 py-2.5 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-500 disabled:to-gray-600 disabled:cursor-not-allowed transition-all font-medium'>
              Submit Vote
            </button>
          </form>

          {hasVoted && (
            <div className='animate-fade-in'>
              <h2 className='text-xl font-semibold mb-4 text-white/90'>Current Standings</h2>
              <div className='space-y-3'>
                {themes.map(theme => (
                  <div
                    key={theme.id}
                    className='bg-white/5 backdrop-blur-lg border border-white/10 rounded-xl p-4'>
                    <div className='flex justify-between items-center mb-2'>
                      <h3 className='font-medium'>{theme.name}</h3>
                      <div className='text-sm text-white/60'>
                        {theme._count.votes} / {theme.maxVotes}
                      </div>
                    </div>
                    <div className='relative h-2 bg-white/5 rounded-full overflow-hidden'>
                      <div
                        className='absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-1000'
                        style={{
                          width: `${(theme._count.votes / theme.maxVotes) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
}
