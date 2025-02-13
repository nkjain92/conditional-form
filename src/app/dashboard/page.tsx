'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState([{ name: '', maxVotes: '' }]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formId, setFormId] = useState('');

  const addOption = () => {
    setOptions([...options, { name: '', maxVotes: '' }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const updateOption = (index: number, field: keyof (typeof options)[0], value: string) => {
    const newOptions = [...options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title) {
      setError('Please enter a form title');
      return;
    }

    if (options.some(option => !option.name)) {
      setError('Please fill in all option names');
      return;
    }

    try {
      const response = await fetch('/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          themes: options.map(opt => ({
            name: opt.name,
            maxVotes: parseInt(opt.maxVotes) || 3, // Default to 3 if not specified
          })),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setFormId(data.id);
      setSuccess('Form created successfully! Share this link with others:');
      setTitle('');
      setDescription('');
      setOptions([{ name: '', maxVotes: '' }]);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to create form');
    }
  };

  if (!user) {
    router.push('/');
    return null;
  }

  return (
    <main className='min-h-screen p-8 bg-[#0A0A0A] text-white'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold mb-2 text-center bg-gradient-to-r from-white to-white/60 text-transparent bg-clip-text'>
          Create New Form
        </h1>
        <p className='text-lg text-center mb-8 text-white/60'>Design your custom voting form</p>

        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-4 bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10'>
            <div>
              <label htmlFor='title' className='block text-sm font-medium text-white/80 mb-1'>
                Form Title
              </label>
              <input
                type='text'
                id='title'
                value={title}
                onChange={e => setTitle(e.target.value)}
                className='block w-full rounded-xl border border-white/10 px-4 py-2.5 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all'
                placeholder='Enter form title'
                required
              />
            </div>

            <div>
              <label htmlFor='description' className='block text-sm font-medium text-white/80 mb-1'>
                Description (Optional)
              </label>
              <textarea
                id='description'
                value={description}
                onChange={e => setDescription(e.target.value)}
                className='block w-full rounded-xl border border-white/10 px-4 py-2.5 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all'
                placeholder='Enter form description'
                rows={3}
              />
            </div>
          </div>

          <div className='space-y-4 bg-white/5 backdrop-blur-lg p-6 rounded-2xl border border-white/10'>
            <div className='flex justify-between items-center'>
              <h2 className='text-xl font-semibold'>Options</h2>
              <button
                type='button'
                onClick={addOption}
                className='text-blue-400 hover:text-blue-300 transition-colors'>
                + Add Option
              </button>
            </div>

            <div className='space-y-3'>
              {options.map((option, index) => (
                <div key={index} className='flex gap-3'>
                  <div className='flex-1'>
                    <input
                      type='text'
                      value={option.name}
                      onChange={e => updateOption(index, 'name', e.target.value)}
                      className='block w-full rounded-xl border border-white/10 px-4 py-2.5 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all'
                      placeholder='Option name'
                      required
                    />
                  </div>
                  <div className='w-32'>
                    <input
                      type='number'
                      value={option.maxVotes}
                      onChange={e => updateOption(index, 'maxVotes', e.target.value)}
                      className='block w-full rounded-xl border border-white/10 px-4 py-2.5 bg-white/5 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all'
                      min='1'
                      placeholder='Max votes (3)'
                    />
                  </div>
                  {options.length > 1 && (
                    <button
                      type='button'
                      onClick={() => removeOption(index)}
                      className='text-red-400 hover:text-red-300 transition-colors p-2'
                      aria-label='Remove option'>
                      <svg
                        xmlns='http://www.w3.org/2000/svg'
                        className='h-5 w-5'
                        fill='none'
                        viewBox='0 0 24 24'
                        stroke='currentColor'>
                        <path
                          strokeLinecap='round'
                          strokeLinejoin='round'
                          strokeWidth={2}
                          d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16'
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className='text-red-400 text-sm bg-red-500/10 border border-red-500/20 p-4 rounded-xl'>
              {error}
            </div>
          )}
          {success && (
            <div className='text-green-400 text-sm bg-green-500/10 border border-green-500/20 p-4 rounded-xl'>
              <p>{success}</p>
              {formId && (
                <div className='mt-2'>
                  <code className='bg-white/10 px-2 py-1 rounded'>
                    {window.location.origin}/form/{formId}
                  </code>
                </div>
              )}
            </div>
          )}

          <button
            type='submit'
            className='w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl px-4 py-3 hover:from-blue-600 hover:to-blue-700 transition-all font-medium'>
            Create Form
          </button>
        </form>
      </div>
    </main>
  );
}
