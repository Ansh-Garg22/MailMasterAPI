const List = require('../models/list');

exports.createList = async (req, res) => {
  try {
    const { title, customProperties } = req.body;
    const existingList = await List.findOne({ title });

    if (existingList) {
      return res.status(400).json({ message: 'List already exists' });
    }

    const list = new List({ title, customProperties });
    await list.save();
    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
