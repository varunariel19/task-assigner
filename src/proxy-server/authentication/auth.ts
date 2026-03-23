import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { ConfigUrls } from "../const";
import { prisma } from "../connection";

interface UserResponse extends Response {
    user?: any;
}

const handleValidateToken = async (req: Request, res: UserResponse) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(404).json({ message: "Token doesn't exists !!" });
            return;
        };
        const key = ConfigUrls.jwtKey;
        const decoded: any = await new Promise((resolve, reject) => {
            jwt.verify(token, key, (err: any, decoded: any) => {
                if (err) reject(null);

                resolve(decoded);
            });
        });

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: { avatar: true, id: true, username: true, email: true, role: true }
        });

        res.status(200).json({ message: "Token  verified", validation: { ok: true, user: user } });
        return;

    }
    catch (error: any) {
        res.status(505).json({ message: `Internal server error !! ${error.message} ` });
        return;
    }
}

const handleGenerateToken = (userId: string) => {

    const key = ConfigUrls.jwtKey;
    const token = jwt.sign(
        { userId: userId },
        key,
        { expiresIn: "7d" }
    );

    return token;
}


export { handleValidateToken, handleGenerateToken }