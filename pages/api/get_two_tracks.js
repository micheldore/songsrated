import { getSession } from "next-auth/react";
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
        console.log("No tracks found");
        await myTrack.getMyTopTracksFromSpotifyAndInsertIntoDatabase();
        tracks =
            await myTrack.getTwoRandomTracksWhichHaveNotBeenComparedByThisUser();
        res.json(tracks);
    } else {
        res.json(tracks);
    }
};
