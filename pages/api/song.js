import { getSession } from "next-auth/react";
import Track from "../../models/Track";
import User from "../../models/User";
const user = new User();
var dbUser = null;

export default async (req, res) => {
    // Check if method is post, if not return error
    if (req.method !== "GET") {
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
        session?.user?.username,
        true
    );

    if (!dbUser?.id) {
        res.statusCode = 403;
        res.json({ error: "User not found" });
        return;
    }

    if (!req.query?.id || !req.query?.id.length) {
        res.statusCode = 400;
        res.json({ error: "Missing track id" });
        return;
    }

    const trackInfo = await new Track().formatTrackForInfoPage(
        req.query.id,
        dbUser.id,
        req
    );

    if (!trackInfo) {
        res.statusCode = 404;
        res.json({ error: "Track not found" });
        return;
    }

    res.json(trackInfo);
};
