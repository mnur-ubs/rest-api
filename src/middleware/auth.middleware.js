import jwtHelper from "../helper/jwt.helper.js";

const publicUrls = [
    '/',
    '/login',
    '/refresh'
];

const AuthMiddleware = (req, res, next) => { 
    try {
        if (publicUrls.includes(req.originalUrl)) {
            return next();
        }
        const authHeader = req.headers['authorization'];
        if (authHeader) {
            const [bearer, token] = authHeader && authHeader.split(' ');
            if (token == null) {
                res.status(410).json({
                    status: 401,
                    success: false,
                    message: 'Token not found'
                })
            } else {
                const decode = jwtHelper.decryptToken(token);
                if (decode == null) {
                    res.status(410).json({
                        status: 401,
                        success: false,
                        message: 'Invalid token or token is expired!'
                    })
                } else {
                    next();
                }
            }
        } else {
            res.status(401).json({
                status: 401,
                success: false,
                message: 'Authorization not found'
            });
        }
    } catch (error) {
        res.status(401).json({
            status: 401,
            success: false,
            message: 'Invalid token',
            error
        });
    }
}

export default AuthMiddleware;