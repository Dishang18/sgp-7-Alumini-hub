const News = require('../models/newsModel');

exports.createNews = async (req, res) => {
  try {
    const { title, content } = req.body;
    const createdBy = req.user._id;
  const createdByModel = req.user.role === 'professor' ? 'Professor' : 'CollegeAdmin';
    const news = await News.create({ title, content, createdBy, createdByModel });
    res.status(201).json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllNews = async (req, res) => {
  try {
    const news = await News.find().sort({ createdAt: -1 });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateNews = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const news = await News.findByIdAndUpdate(id, { title, content, updatedAt: Date.now() }, { new: true });
    res.json(news);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNews = async (req, res) => {
  try {
    const { id } = req.params;
    await News.findByIdAndDelete(id);
    res.json({ message: 'News deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
