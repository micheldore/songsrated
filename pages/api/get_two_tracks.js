import { getSession } from "next-auth/react";
import spotifyApi from "../../lib/spotify";
import User from "../../models/User";
import prisma from "../../db";
const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 200 });
const user = new User();
var dbUser = null;
var session = null;

export default async (req, res) => {
    // Check if method is GET, if not return error
    if (req.method !== "GET") {
        res.statusCode = 405;
        res.end();
        return;
    }

    //Get bearer token from request format it and set it to spotifyApi
    const bearerToken = req.headers["authorization"];
    if (bearerToken && bearerToken.startsWith("Bearer ")) {
        const bearer = bearerToken.split(" ");
        const token = bearer[1];
        spotifyApi.setAccessToken(token);
    } else {
        res.statusCode = 401;
        res.json({ error: "Bearer token not found" });
        return;
    }

    session = await getSession({ req });
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

    var tracks = await getTwoRandomTracksWhichHaveNotBeenComparedByThisUser();

    if (!tracks.length) {
        tracks = await getTopTracks();
        res.json(tracks);
    } else {
        res.json(tracks);
    }
};

async function getTopTracks() {
    const toptracks = await spotifyApi.getMyTopTracks({ limit: 50 });
    var formattedTopTracks = [];
    var formattedArtists = [];
    var formattedAlbums = [];
    var formattedMyTracks = [];

    for (const track of toptracks?.body?.items) {
        formattedTopTracks.push({
            spotify_id: track.id,
            name: track.name,
            artist_id: track.artists[0].id,
            album_id: track.album.id,
            rating: (track.popularity ?? 0) + 1500,
        });

        formattedArtists.push({
            spotify_id: track.artists[0].id,
            name: track.artists[0].name,
        });

        formattedAlbums.push({
            spotify_id: track.album.id,
            name: track.album.name,
            artist_id: track.artists[0].id,
            release_date: new Date(track.album.release_date),
        });

        if (dbUser?.id) {
            formattedMyTracks.push({
                track_id: track.id,
                user_id: dbUser?.id,
            });
        }
    }

    await prisma.track.createMany({
        data: formattedTopTracks,
        skipDuplicates: true,
    });
    await prisma.artist.createMany({
        data: formattedArtists,
        skipDuplicates: true,
    });
    await prisma.album.createMany({
        data: formattedAlbums,
        skipDuplicates: true,
    });
    await prisma.myTrack.createMany({
        data: formattedMyTracks,
        skipDuplicates: true,
    });

    return getTwoRandomTracksWhichHaveNotBeenComparedByThisUser();
}

async function getTwoRandomTracksWhichHaveNotBeenComparedByThisUser() {
    function get2RandomSongsFromMyTracks(arr, n = 2) {
        const shuffled = arr.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    }

    async function checkIfTracksHaveNotVoted(tracks) {
        const [track1, track2] = tracks;

        const isFound = await prisma.vote.findFirst({
            where: {
                OR: [
                    {
                        user_id: dbUser?.id,
                        winner_id: track1?.id,
                        loser_id: track2?.id,
                    },
                    {
                        user_id: dbUser?.id,
                        winner_id: track2?.id,
                        loser_id: track1?.id,
                    },
                ],
            },
        });

        return isFound?.length ?? false;
    }

    var myTracks = myCache.get(`${dbUser?.id}tracks`);
    if (myTracks == undefined) {
        myTracks = await prisma.myTrack.findMany({
            where: {
                user_id: dbUser?.id,
            },
            select: {
                track_id: true,
            },
        });
        myCache.set(`${dbUser?.id}tracks`, myTracks);
    }

    var haveNotVoted = false;
    var maxRetries = 10;
    var retries = 0;
    var tracks = [];

    while (!haveNotVoted && retries < maxRetries) {
        tracks = get2RandomSongsFromMyTracks(myTracks);
        const [track1, track2] = tracks;
        if (track1?.track_id == track2?.track_id) {
            continue;
        }
        haveNotVoted = await checkIfTracksHaveNotVoted(tracks);
        retries++;
    }

    tracks = await spotifyApi.getTracks(tracks.map((track) => track.track_id));

    var formattedTracks = [];
    for (var track of tracks?.body?.tracks) {
        var formattedTrack = {};
        formattedTrack.spotify_id = track.id;
        formattedTrack.name = track.name;
        formattedTrack.artist_name = track.artists[0].name;
        formattedTrack.album_name = track.album.name;
        formattedTrack.album_image = track.album.images[0].url;
        formattedTrack.preview_url = track.preview_url;
        formattedTrack.release_date = new Date(track.album.release_date);

        formattedTrack.rating = (
            await prisma.track.findFirst({
                where: {
                    spotify_id: track.id,
                },
                select: {
                    rating: true,
                },
            })
        ).rating;

        formattedTracks.push(formattedTrack);
    }

    return formattedTracks;
}
