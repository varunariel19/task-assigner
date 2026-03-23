import dotenv from "dotenv";
dotenv.config();


const ConfigUrls = {
    prismaDbUrl: process.env['DATABASE_URL']!,
    jwtKey : process.env['JWT_SECRET']!,

}

const avatars = [
    "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_1.png",
    "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_2.png",
    "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_3.png",
    "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_4.png",
    "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_5.png",
    "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_6.png",
    "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_7.png",
    "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_8.png",
    "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_9.png",
    "https://cdn.jsdelivr.net/gh/alohe/avatars/png/vibrent_10.png"
];

export { ConfigUrls  , avatars}