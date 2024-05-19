const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
const fastcsv = require('fast-csv');
const User = require('../models/user');
const List = require('../models/list');

exports.processCSVFile = async (filePath, listId, res) => {
  try {
    const list = await List.findById(listId);
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const customProperties = list.customProperties.reduce((acc, prop) => {
      acc[prop.title] = prop.fallbackValue;
      return acc;
    }, {});

    const results = [];
    const errors = [];
    const emailsInList = new Set();
    const emailsToAdd = new Set();

    const usersInList = await User.find({ list: listId });
    usersInList.forEach(user => emailsInList.add(user.email));

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        const user = {
          name: data.name,
          email: data.email,
          list: listId,
          customProperties: []
        };

        if (!user.name || !user.email) {
          errors.push({ ...data, error: 'Missing required fields' });
          return;
        }

        if (emailsInList.has(user.email) || emailsToAdd.has(user.email)) {
          errors.push({ ...data, error: 'Duplicate email' });
          return;
        }

        for (const key in data) {
          if (key !== 'name' && key !== 'email') {
            user.customProperties.push({
              title: key,
              value: data[key] || customProperties[key] || ''
            });
          }
        }

        results.push(user);
        emailsToAdd.add(user.email);
      })
      .on('end', async () => {
        try {
          const insertedUsers = await User.insertMany(results, { ordered: false });
          const addedCount = insertedUsers.length;

          if (errors.length > 0) {
            const errorFilePath = path.join(__dirname, '..', 'uploads', `errors-${Date.now()}.csv`);
            const ws = fs.createWriteStream(errorFilePath);
            fastcsv
              .write(errors, { headers: true })
              .pipe(ws)
              .on('finish', () => {
                res.json({
                  message: 'Upload complete',
                  addedCount,
                  errorsCount: errors.length,
                  totalCount: addedCount + errors.length,
                  errorFile: errorFilePath
                });
              });
          } else {
            res.json({
              message: 'Upload complete',
              addedCount,
              errorsCount: 0,
              totalCount: addedCount
            });
          }
        } catch (error) {
          res.status(500).json({ message: error.message });
        }
      })
      .on('error', (error) => {
        res.status(500).json({ message: error.message });
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
