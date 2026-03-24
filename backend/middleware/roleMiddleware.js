const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        if (!roles.includes(req.user.userType)) {
            return res.status(403).json({ 
                error: `User role ${req.user.userType} is not authorized` 
            });
        }
        next();
    };
};

module.exports = { authorize };