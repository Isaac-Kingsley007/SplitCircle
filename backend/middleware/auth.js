function authMiddleware(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ success: false, error: 'Unauthorized' });
    }
    next();
}

export default authMiddleware;