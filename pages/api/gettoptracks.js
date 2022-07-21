import { PrismaClient } from "@prisma/client";
import { getSession } from "next-auth/react";
import spotifyApi from "../../lib/spotify";
const prisma = new PrismaClient();

export default async (req, res) => {
    const session = await getSession({ req });
    const top50tracks = await spotifyApi.getMyTopTracks();

    res.json(top50tracks);
};

async function randomTracks(count) {
    const skip = Math.max(0, Math.floor(Math.random() * itemCount) - count);
    const orderBy = randomPick(["spotify_id", "name", "artist_id"]);
    const orderDir = randomPick([SortOrder.asc, SortOrder.desc]);

    return await prisma.mytracks.findMany({
        take: count,
        skip: skip,
        orderBy: { [orderBy]: orderDir },
    });
}
