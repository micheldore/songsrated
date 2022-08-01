import { getSession } from "next-auth/react";
import Album from "./Album";
import Track from "./Track";
import Artist from "./Artist";
import prisma from "../db";
import serverSpotify from "../hooks/serverSpotify";

const NodeCache = require("node-cache");
const myCache = new NodeCache({ stdTTL: 200 });

class MyTrack {
    constructor(req) {
        this.session = getSession({ req });
        this.track = new Track();
        this.album = new Album();
        this.artist = new Artist();
    }

    async getMyTopTracksFromSpotify(count = 50) {
        const spotifyApi = await serverSpotify(await this.session);
        return await spotifyApi.getMyTopTracks({ limit: count });
    }

    async getMyTopTracksFromSpotifyAndInsertIntoDatabase() {
        const toptracks = await this.getMyTopTracksFromSpotify();
        const tracks = this.track.getTracksFromResponse(toptracks);

        await this.track.insert(tracks);
        await this.album.insert(tracks);
        await this.artist.insert(tracks);
        await this.insert(tracks);
    }

    // Function that inserts formatted myTracks into the database
    async insert(tracks) {
        return await prisma.myTrack.createMany({
            data: await this.formatTracksToMyTracksForDatabase(tracks),
            skipDuplicates: true,
        });
    }

    // Format a list of tracks to a list of myTracks for insertion into the database
    async formatTracksToMyTracksForDatabase(tracks) {
        var formattedMyTracks = [];

        for (const track of tracks) {
            formattedMyTracks.push(await this.formatMyTrackForDatabase(track));
        }

        return formattedMyTracks;
    }

    // Function that formats a track object from spotify for insertion as a myTrack object into the database
    async formatMyTrackForDatabase(track) {
        return {
            track_id: track?.id,
            user_id: await this.session.user?.id,
        };
    }

    getTwoRandomSongsFromMyTracks(arr, n = 2) {
        const shuffled = arr.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    }

    async checkIfTracksHaveNotVoted(tracks) {
        const [track1, track2] = tracks;
        const user_id = await this.session?.user?.db_id;

        const isFound = await prisma.vote.findFirst({
            where: {
                OR: [
                    {
                        user_id: user_id,
                        winner_id: track1?.id,
                        loser_id: track2?.id,
                    },
                    {
                        user_id: user_id,
                        winner_id: track2?.id,
                        loser_id: track1?.id,
                    },
                ],
            },
        });

        return isFound?.length ?? false;
    }

    async getTwoRandomTracksWhichHaveNotBeenComparedByThisUser() {
        const user_id = await this.session?.user?.db_id;
        var myTracks = myCache.get(`${user_id}tracks`);

        if (myTracks == undefined) {
            myTracks = await prisma.myTrack.findMany({
                where: {
                    user_id: user_id,
                },
                select: {
                    track_id: true,
                },
            });

            myCache.set(`${user_id}tracks`, myTracks);
        }

        if (myTracks.length < 2) {
            return [];
        }

        var haveNotVoted = false;
        var maxRetries = 10;
        var retries = 0;
        var tracks = [];

        while (!haveNotVoted && retries < maxRetries) {
            tracks = this.getTwoRandomSongsFromMyTracks(myTracks);
            const [track1, track2] = tracks;
            if (track1?.track_id == track2?.track_id) {
                continue;
            }
            haveNotVoted = await this.checkIfTracksHaveNotVoted(tracks);
            retries++;
        }

        const spotifyApi = await serverSpotify(await this.session);
        tracks = await spotifyApi.getTracks(
            tracks.map((track) => track.track_id)
        );

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
}

export default MyTrack;
