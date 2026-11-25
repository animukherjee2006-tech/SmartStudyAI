import StudyNote from '../models/StudyNote.js';

export async function getNotes(req, res) {
  try {
    const { search } = req.query;
    const query = { userId: req.user._id };

    if (search && search.trim()) {
      query.topicTitle = { $regex: search.trim(), $options: 'i' };
    }

    const notes = await StudyNote.find(query).sort({ createdAt: -1 }).limit(50);

    return res.status(200).json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error('GetNotes Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve saved notes.',
    });
  }
}

export async function getNoteById(req, res) {
  try {
    const note = await StudyNote.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        message: 'Study note not found.',
      });
    }

    return res.status(200).json({
      success: true,
      note,
    });
  } catch (error) {
    console.error('GetNoteById Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve study note.',
    });
  }
}

export async function deleteNote(req, res) {
  try {
    const deleted = await StudyNote.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Study note not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Study note deleted.',
    });
  } catch (error) {
    console.error('DeleteNote Error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete study note.',
    });
  }
}
