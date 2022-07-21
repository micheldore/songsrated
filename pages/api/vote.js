import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";
import spotifyApi from "../../lib/spotify";
import User from "../../models/User";
const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 200 });
const prisma = new PrismaClient();
const user = new User();
var dbUser = null;

export default async (req, res) => {
    // Check if method is post, if not return error
    if (req.method !== "POST") {
        res.statusCode = 405;
        res.end();
        return;
    }
    const session = await getSession({ req });
    if (!session?.user?.email) {
        res.statusCode = 403;
        res.json({ error: "User not found" });
        return;
    }

    dbUser = await user.getAndOrCreateUser(
        session?.user?.email,
        session?.user?.username
    );

    if (!dbUser?.id) {
        res.statusCode = 403;
        res.json({ error: "User not found" });
        return;
    }

    // Check if body contains needed ids, then get winner id and loser id from the request body
    if (
        !req.body?.winner_id ||
        !req.body?.loser_id ||
        !req.body?.winner_id.length ||
        !req.body?.loser_id.length
    ) {
        res.statusCode = 400;
        res.json({ error: "Missing winner or loser id" });
        return;
    }
};
