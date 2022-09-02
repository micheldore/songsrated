import { getSession } from "next-auth/react";
import { exit } from "process";
import MyTrack from "../../models/MyTrack";
var session = null;

export default async (req, res) => {
    const myTrack = new MyTrack(req);

    // Check if method is GET, if not return error
    if (req.method !== "GET") {
        res.statusCode = 405;
        res.end();
        return;
    }

    session = await getSession({ req });
    if (!session?.user?.email) {
        res.statusCode = 403;
        res.json({ error: "User not found" });
        return;
    }

    if (!session?.user?.db_id) {
        res.statusCode = 403;
        res.json({ error: "User not found" });
        return;
    }

    var tracks =
        await myTrack.getTwoRandomTracksWhichHaveNotBeenComparedByThisUser();

    if (!tracks.length) {
        await myTrack.getMyTopTracksFromSpotifyAndInsertIntoDatabase();
        tracks =
            await myTrack.getTwoRandomTracksWhichHaveNotBeenComparedByThisUser();
        if (!tracks) res.json({ error: "No tracks found" });
        else {
            res.json(tracks);
        }
    } else {
        if (!tracks) res.json({ error: "No tracks found" });
        res.json(tracks);
    }
};
