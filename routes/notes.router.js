
const express = require('express');
const router = express.Router();
const Note = require('../models/note.model');
const User = require('../models/user.model');
const authenticateToken = require("../middleware/auth");

// Get all notes for the authenticated user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const notes = await Note.find({ userId });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get a list of all notes shared to the authenticated user
router.get('/shared', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find notes where the user is listed in the sharedWith array
    const sharedNotes = await Note.find({ sharedWith: userId });

    res.json(sharedNotes);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Search for notes based on keywords for the authenticated user router
router.get('/search', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const notes = await Note.find({ userId, $text: { $search: query } });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



// Get a note by ID for the authenticated user
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const note = await Note.findOne({ _id: req.params.id, userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Create a new note for the authenticated user
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, content } = req.body;
    const newNote = new Note({ title, content, userId });
    await newNote.save();
    res.json(newNote);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Update an existing note by ID for the authenticated user
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, content } = req.body;
    const updatedNote = await Note.findOneAndUpdate(
      { _id: req.params.id, userId },
      { $set: { title, content } },
      { new: true }
    );
    if (!updatedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json(updatedNote);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Delete a note by ID for the authenticated user
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const deletedNote = await Note.findOneAndDelete({ _id: req.params.id, userId });
    if (!deletedNote) {
      return res.status(404).json({ error: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Share a note with another user for the authenticated user
router.post('/:id/share', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { username } = req.body;

    const noteToShare = await Note.findOne({ _id: req.params.id, userId });
    if (!noteToShare) {
      return res.status(404).json({ error: 'Note not found for the user!' });
    }

    const userToShareWith = await User.findOne({ "username": username});
    if (!userToShareWith) {
      return res.status(404).json({ error: 'User not found' });
    }

    //Check if the note is already shared to the user
    await Note.populate(noteToShare, { path: 'sharedWith', select: 'username' });
    // Extract and send the list of shared users
    const sharedUsers = noteToShare.sharedWith.map(info => info.username);
    // Add user to shared list if not shared already
    if(sharedUsers.indexOf(username) === -1) {
      noteToShare.sharedWith.push(userToShareWith._id);
      await noteToShare.save();
    } else {
      return res.status(403).json({ error: 'Already shared to the user!' });
    }    

    res.json({ message: 'Note shared successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});




// Get a list of all users that a given note is shared with
router.get('/:id/shared-users', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const noteId = req.params.id;

    // Check if the note exists and belongs to the authenticated user
    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Populate the sharedWith field to get the user details
    await Note.populate(note, { path: 'sharedWith', select: 'username' });
    // Extract and send the list of shared users
    const sharedUsers = note.sharedWith.map(info => info.username);
    res.json(sharedUsers);
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;