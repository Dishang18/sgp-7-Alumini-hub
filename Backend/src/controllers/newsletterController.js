const Newsletter = require('../models/newsletterModel');

exports.createNewsletter = async (req, res) => {
  try {
    const { title, content } = req.body;
    const createdBy = req.user._id;
  const createdByModel = req.user.role === 'professor' ? 'Professor' : 'CollegeAdmin';
    const newsletter = await Newsletter.create({ title, content, createdBy, createdByModel });
    res.status(201).json(newsletter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAllNewsletters = async (req, res) => {
  try {
    const newsletters = await Newsletter.find().sort({ createdAt: -1 });
    res.json(newsletters);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const newsletter = await Newsletter.findByIdAndUpdate(id, { title, content, updatedAt: Date.now() }, { new: true });
    res.json(newsletter);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.deleteNewsletter = async (req, res) => {
  try {
    const { id } = req.params;
    await Newsletter.findByIdAndDelete(id);
    res.json({ message: 'Newsletter deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
