import { createHash } from "crypto";
import jsonwebtoken from 'jsonwebtoken';
import { log } from "console";

const JWT_SECRET_KEY = 'Secret-api';
const JWT_EXP_TOKEN = 3600;
const { sign, verify, decode } = jsonwebtoken;

const jwt = {
    createToken: (payload = {}) => {
        payload.exp = Math.floor(Date.now() / 1000) + JWT_EXP_TOKEN;
        payload.iat = Math.floor((Date.now() / 1000));
        payload.iss = 'https://ubs.ac.id';
        payload.aud = 'https://ubs.ac.id';
        const token = sign(payload, JWT_SECRET_KEY);
        return [payload, token];
    }, 
    decryptToken: token => {
        try {
            const decoded = verify(token, JWT_SECRET_KEY);
            return decoded;
        } catch (error) {
            throw error;
        }
    },
};

export default jwt;