import { getSession } from "next-auth/react";
import Album from "./Album";
import Track from "./Track";
import Artist from "./Artist";
import prisma from "../db";
import serverSpotify from "../hooks/serverSpotify";
import { exit } from "process";

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

    async getOffsetFromDatabase() {
        const session = await this.session;
        const user = await prisma.user.findFirst({
            where: {
                id: session?.user?.db_id,
            },
            select: {
                offset: true,
            },
        });

        return user?.offset ?? 0;
    }

    async setOffsetInDatabase(offset) {
        // Check if offset is higher than 10000 and lower than 0, if so reset to 0
        if (offset > 10000 || offset < 0) {
            offset = 0;
        }
        const session = await this.session;

        return await prisma.user.update({
            where: {
                id: session?.user?.db_id,
            },
            data: {
                offset: offset,
            },
        });
    }

    // Get track from my spotify tracks library
    async getTracksFromSpotify() {
        const spotifyApi = await serverSpotify(await this.session);
        const offset = await this.getOffsetFromDatabase();
        const tracks = await spotifyApi.getMySavedTracks({
            limit: 50,
            offset: offset,
        });
        const len = tracks?.body?.items?.length ?? 0;
        await this.setOffsetInDatabase(offset + Math.min(len, 50));
        var formattedTracks = [];

        for (const track of tracks?.body?.items) {
            if (track?.track?.id && track?.track?.preview_url) {
                formattedTracks.push(track?.track);
            }
        }
        return formattedTracks;
    }

    async getMyTopTracksFromSpotifyAndInsertIntoDatabase() {
        const toptracks = await this.getMyTopTracksFromSpotify();
        const tracks = await this.getTracksFromSpotify();
        // const tracks = this.track.getTracksFromResponse(libraryTracks);
        var promises = [];
        promises.push(this.insert(tracks));
        promises.push(this.track.insert(tracks));
        promises.push(this.album.insert(tracks));
        promises.push(this.artist.insert(tracks));

        return await Promise.all(promises);
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
        const session = await this.session;
        const user_id = session?.user?.db_id;

        return {
            track_id: track?.id,
            user_id: user_id,
        };
    }

    getTwoRandomSongsFromMyTracks(arr, n = 2) {
        const shuffled = arr.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    }

    async checkIfTracksHaveNotVoted(tracks) {
        // check if tracks contain two tracks
        if (tracks.length != 2) {
            return false;
        }

        const [track1, track2] = tracks;
        const session = await this.session;
        const user_id = session?.user?.db_id;

        const isFound = await prisma.vote.findFirst({
            where: {
                OR: [
                    {
                        user_id: user_id,
                        winner_id: track1?.track_id,
                        loser_id: track2?.track_id,
                    },
                    {
                        user_id: user_id,
                        winner_id: track2?.track_id,
                        loser_id: track1?.track_id,
                    },
                ],
            },
        });
        if (isFound == null) return true;
        else return false;
    }

    async getMyTrackFromDB(user_id) {
        return await prisma.myTrack.findMany({
            where: {
                user_id: user_id,
            },
            select: {
                track_id: true,
            },
        });
    }

    async getTwoRandomTracksWhichHaveNotBeenComparedByThisUser() {
        const session = await this.session;
        const user_id = session?.user?.db_id;

        // var myTracks = myCache.get(`${user_id}tracks`);

        // if (!myTracks) {
        var myTracks = await this.getMyTrackFromDB(user_id);
        //     myCache.set(`${user_id}tracks`, myTracks);
        // }

        if (myTracks.length < 2) {
            return [];
        }

        var haveNotVoted = false;
        var maxRetries = 20;
        var retries = 0;
        var tracks = [];

        while (!haveNotVoted && retries < maxRetries) {
            tracks = this.getTwoRandomSongsFromMyTracks(myTracks);

            const [track1, track2] = tracks;
            if (track1?.track_id == track2?.track_id) {
                continue;
            }
            haveNotVoted = await this.checkIfTracksHaveNotVoted(tracks);

            if (retries == maxRetries - 10) {
                await this.getMyTopTracksFromSpotifyAndInsertIntoDatabase();
                myTracks = await this.getMyTrackFromDB(user_id);
            }

            retries++;
        }
        if (!haveNotVoted) {
            return [];
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
