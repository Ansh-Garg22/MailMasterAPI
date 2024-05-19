const nodemailer = require('nodemailer');
const List = require('../models/list');
const User = require('../models/user');

exports.sendEmailToListMembers = async (req, res) => {
  const { listId, subject, body } = req.body;

  try {
    const list = await List.findById(listId).populate('customProperties');
    if (!list) {
      return res.status(404).json({ message: 'List not found' });
    }

    const users = await User.find({ list: listId });
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found in the list' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const failedEmails = [];

    for (const user of users) {
      let emailBody = body || `Hey [name]!\n\nThank you for signing up with your email [email]. We have received your city as [city].\n\nTeam MathonGo.`;

      emailBody = emailBody.replace('[name]', user.name);
      emailBody = emailBody.replace('[email]', user.email);
      
      user.customProperties.forEach(prop => {
        emailBody = emailBody.replace(`[${prop.title}]`, prop.value);
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: subject,
        text: emailBody,
      };

      try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to: ${user.email}`);
      } catch (error) {
        console.log(`Error sending email to: ${user.email}`);
        failedEmails.push({ email: user.email, error: error.message });
      }
    }

    if (failedEmails.length > 0) {
      res.status(207).json({ 
        message: 'Some emails failed to send', 
        failedEmails, 
        sentCount: users.length - failedEmails.length 
      });
    } else {
      res.status(200).json({ message: 'Emails sent successfully', sentCount: users.length });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
