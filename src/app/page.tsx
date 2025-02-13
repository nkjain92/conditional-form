'use client';

import { useEffect, useState } from 'react';

interface Theme {
  id: string;
  name: string;
  maxVotes: number;
  _count: {
    votes: number;
  };
}

export default function Home() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [voterName, setVoterName] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchThemes();
  }, []);

  const fetchThemes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/themes');
      const data = await response.json();
      if (Array.isArray(data)) {
        setThemes(data);
      } else {
        setError('Invalid data format received');
      }
    } catch (error) {
      setError('Failed to fetch themes');
    } finally {
      setIsLoading(false);
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
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          themeId: selectedTheme,
          voterName,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      setSuccess('Vote submitted successfully!');
      setVoterName('');
      setSelectedTheme('');
      fetchThemes();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Failed to submit vote');
      }
    }
  };

  const availableThemes = themes.filter(theme => theme._count.votes < theme.maxVotes);

  if (isLoading) {
    return (
      <main className='min-h-screen p-8 bg-gray-50'>
        <div className='max-w-2xl mx-auto text-center'>
          <p>Loading themes...</p>
        </div>
      </main>
    );
  }

  return (
    <main className='min-h-screen p-8 bg-gray-50'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold mb-8 text-center'>Catering Theme Voting</h1>

        <div className='mb-8'>
          <h2 className='text-xl font-semibold mb-4'>Current Standings</h2>
          <div className='grid gap-4'>
            {themes.map(theme => (
              <div key={theme.id} className='p-4 border rounded-lg bg-white shadow-sm'>
                <div className='flex justify-between items-center'>
                  <h3 className='font-medium'>{theme.name}</h3>
                  <div className='text-sm text-gray-600'>
                    {theme._count.votes} / {theme.maxVotes} votes
                  </div>
                </div>
                <div className='mt-2 bg-gray-200 rounded-full h-2'>
                  <div
                    className='bg-blue-600 rounded-full h-2 transition-all duration-300'
                    style={{
                      width: `${(theme._count.votes / theme.maxVotes) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={handleVote} className='space-y-6 bg-white p-6 rounded-lg shadow'>
          <div>
            <label htmlFor='voterName' className='block text-sm font-medium text-gray-700 mb-1'>
              Your Name
            </label>
            <input
              type='text'
              id='voterName'
              value={voterName}
              onChange={e => setVoterName(e.target.value)}
              className='block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-3'>Select Theme</label>
            <div className='space-y-3'>
              {availableThemes.length > 0 ? (
                availableThemes.map(theme => (
                  <label
                    key={theme.id}
                    className='flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors'>
                    <input
                      type='radio'
                      name='theme'
                      value={theme.id}
                      checked={selectedTheme === theme.id}
                      onChange={e => setSelectedTheme(e.target.value)}
                      className='h-4 w-4 text-blue-600 focus:ring-blue-500'
                      required
                    />
                    <span className='ml-3'>{theme.name}</span>
                    <span className='ml-auto text-sm text-gray-500'>
                      {theme.maxVotes - theme._count.votes} spots left
                    </span>
                  </label>
                ))
              ) : (
                <p className='text-gray-500 text-center py-4'>
                  All themes have reached their maximum votes
                </p>
              )}
            </div>
          </div>

          {error && <div className='text-red-600 text-sm bg-red-50 p-3 rounded'>{error}</div>}
          {success && (
            <div className='text-green-600 text-sm bg-green-50 p-3 rounded'>{success}</div>
          )}

          <button
            type='submit'
            disabled={availableThemes.length === 0}
            className='w-full bg-blue-600 text-white rounded-md px-4 py-2 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors'>
            Submit Vote
          </button>
        </form>
      </div>
    </main>
  );
}
