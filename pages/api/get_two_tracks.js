import { getSession } from "next-auth/react";
import { exit } from "process";
import MyTrack from "../../models/MyTrack";
import Vote from "../../models/Vote";
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

    // const voteCount = await new Vote().getVoteCountOfToday(
    //     session?.user?.db_id
    // );

    // if (voteCount >= 100) {
    //     res.statusCode = 403;
    //     res.json({ error: "You have reached your daily vote limit" });
    //     return;
    // }

    const tracks = await myTrack.getTwoRandomUnvotedTracks();

    if (!tracks.length) res.json({ error: "No tracks found" });
    else res.json(tracks);
};
