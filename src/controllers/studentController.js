import asyncHandler from 'express-async-handler'
import Profile from '../models/Profile.js'
import Internship from '../models/Internship.js'

// @desc    Get student favorites
// @route   GET /api/student/:studentId/favorites
// @access  Public (or Private if protected)
const getFavorites = asyncHandler(async (req, res) => {
    const { studentId } = req.params;

    // Find profile by user ID (studentId)
    const profile = await Profile.findOne({ user: studentId });

    if (!profile) {
        // If no profile, return empty list (or 404 if strictly required, but empty list is safer for UI)
        return res.json([]);
    }

    // Populate favorites if needed, or just return IDs. 
    // Dashboard.jsx seems to expect objects or IDs. 
    // "const favoriteIds = Array.isArray(data) ? data.map(fav => fav.internshipId || fav.internship?._id) : []"
    // This implies data is a list of objects like { internshipId: ... } or full objects.
    // The frontend code: "const favoriteIds = Array.isArray(data) ? data.map(fav => fav.internshipId || fav.internship?._id) : []"
    // This suggests the backend might be returning a populated list or a wrapper object.
    // Let's return the list of normalized objects to match the frontend expectation safely.
    // Ideally, we return the list of favorite Internship objects.

    // However, simpler is to return list of objects with internshipId property if that's what it supports.
    // Let's check Dashboard.jsx: "fav.internshipId || fav.internship?._id"
    // So if we return populated Internships, fav._id works? No, "fav.internship?._id".
    // It seems to expect [{ internship: { _id: ... } }, ... ] OR [{ internshipId: ... }] ?
    // Actually, if we look at `toggleFavorite`:
    // api calls: body: { internshipId: i.id, action: 'add'/'remove' }

    // Let's stick to returning an array of "Favorite Objects" if that was the original design intent,
    // OR just return the array of Internship objects if we can make frontend work?
    // Frontend line 226: "data.map(fav => fav.internshipId || fav.internship?._id)"
    // So if we send [{ internshipId: "123" }, { internshipId: "456" }] it works.

    const result = (profile.favorites || []).map(id => ({ internshipId: id }));
    res.json(result);
});

// @desc    Toggle favorite
// @route   POST /api/student/:studentId/favorites
// @access  Public
const toggleFavorite = asyncHandler(async (req, res) => {
    const { studentId } = req.params;
    const { internshipId, action } = req.body;

    if (!internshipId || !action) {
        res.status(400);
        throw new Error('Internship ID and action are required');
    }

    let profile = await Profile.findOne({ user: studentId });

    // Create profile if it doesn't exist? (Unlikely for student, but possible)
    if (!profile) {
        // Determine user email/name if creating new profile? 
        // For now, fail if no profile, or create empty one linked to user.
        // Better to create one.
        profile = await Profile.create({ user: studentId });
    }

    if (!profile.favorites) profile.favorites = [];

    const strId = String(internshipId);
    const exists = profile.favorites.some(id => String(id) === strId);

    if (action === 'add') {
        if (!exists) {
            profile.favorites.push(internshipId);
        }
    } else if (action === 'remove') {
        profile.favorites = profile.favorites.filter(id => String(id) !== strId);
    }

    await profile.save();

    // Return updated list
    const result = profile.favorites.map(id => ({ internshipId: id }));
    res.json(result);
});

export { getFavorites, toggleFavorite }
