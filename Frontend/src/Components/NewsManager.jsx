import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function NewsManager() {
  const [news, setNews] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', content: '' });
  const [loading, setLoading] = useState(false);

  const fetchNews = async () => {
    setLoading(true);
    const res = await axios.get('http://localhost:5000/news', { withCredentials: true });
    setNews(res.data);
    setLoading(false);
  };

  useEffect(() => { fetchNews(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    if (editing) {
      await axios.put(`http://localhost:5000/news/${editing._id}`, form, { withCredentials: true });
    } else {
      await axios.post('http://localhost:5000/news', form, { withCredentials: true });
    }
    setForm({ title: '', content: '' });
    setEditing(null);
    fetchNews();
    setLoading(false);
  };

  const handleEdit = item => {
    setEditing(item);
    setForm({ title: item.title, content: item.content });
  };

  const handleDelete = async id => {
    setLoading(true);
    await axios.delete(`http://localhost:5000/news/${id}`, { withCredentials: true });
    fetchNews();
    setLoading(false);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-2">News & Notices</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <input name="title" value={form.title} onChange={handleChange} placeholder="Title" className="border px-2 py-1 mr-2" required />
        <input name="content" value={form.content} onChange={handleChange} placeholder="Content" className="border px-2 py-1 mr-2" required />
        <button type="submit" className="bg-indigo-600 text-white px-3 py-1 rounded">
          {editing ? 'Update' : 'Add'}
        </button>
        {editing && <button type="button" onClick={() => { setEditing(null); setForm({ title: '', content: '' }); }} className="ml-2 text-gray-500">Cancel</button>}
      </form>
      {loading ? <div>Loading...</div> : (
        <ul>
          {news.map(item => (
            <li key={item._id} className="mb-2 border-b pb-2 flex justify-between items-center">
              <div>
                <strong>{item.title}</strong>: {item.content}
              </div>
              <div>
                <button onClick={() => handleEdit(item)} className="text-blue-600 mr-2">Edit</button>
                <button onClick={() => handleDelete(item._id)} className="text-red-600">Delete</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
