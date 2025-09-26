import React, { useState } from 'react';
import NewsManager from '../Components/NewsManager';
import NewsletterManager from '../Components/NewsletterManager';

export default function University() {
  const [tab, setTab] = useState('news');
  return (
    <div className="max-w-4xl mx-auto mt-8">
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 font-semibold ${tab === 'news' ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-gray-500'}`}
          onClick={() => setTab('news')}
        >
          News & Notices
        </button>
        <button
          className={`ml-4 px-4 py-2 font-semibold ${tab === 'newsletter' ? 'border-b-2 border-indigo-600 text-indigo-700' : 'text-gray-500'}`}
          onClick={() => setTab('newsletter')}
        >
          Newsletter
        </button>
      </div>
      <div>
        {tab === 'news' ? <NewsManager /> : <NewsletterManager />}
      </div>
    </div>
  );
}
