import { getSession } from "next-auth/react";
import User from "../../models/User";
import Vote from "../../models/Vote";
const user = new User();
var dbUser = null;

export default async (req, res) => {
    // Check if method is post, if not return error
    if (req.method !== "POST") {
        res.statusCode = 405;
        res.end();
        return;
    }

    //Get bearer token from request format it and set it to spotifyApi
    // const bearerToken = req.headers["authorization"];
    // if (bearerToken && bearerToken.startsWith("Bearer ")) {
    //     const bearer = bearerToken.split(" ");
    //     const token = bearer[1];
    //     spotifyApi.setAccessToken(token);
    // } else {
    //     res.statusCode = 401;
    //     res.json({ error: "Bearer token not found" });
    //     return;
    // }

    const session = await getSession({ req });
    if (!session?.user?.email) {
        res.statusCode = 403;
        res.json({ error: "User not found" });
        return;
    }

    dbUser = await user.getAndOrCreateUser(
        session?.user?.email,
        session?.user?.username,
        true
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

    var winner_id = req.body?.winner_id;
    var loser_id = req.body?.loser_id;

    // Call vote function from models/Vote.js
    await new Vote().vote(dbUser.id, winner_id, loser_id);

    res.json({ success: true });
};
