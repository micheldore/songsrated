import { getSession } from "next-auth/react";
import prisma from "../db";
import serverSpotify from "../hooks/serverSpotify";
import Vote from "./Vote";

class Track {
    // Function that formats a track object from spotify for insertion into the database
    formatTrackForDatabase(track) {
        return {
            spotify_id: track?.id,
            name: track?.name,
            artist_id: track?.artists?.[0]?.id,
            album_id: track?.album?.id,
            rating: track?.popularity + 1500,
        };
    }

    // Function that returns album from track safely
    async getAlbum(track) {
        return track?.album;
    }

    // Function that returns artist from track safely
    async getArtist(track) {
        return track?.artists?.[0];
    }

    // Format a list of tracks for insertion into the database
    formatTracksForDatabase(tracks) {
        var formattedTracks = [];

        for (const track of tracks)
            formattedTracks.push(this.formatTrackForDatabase(track));
        return formattedTracks;
    }

    // Function that returns a list of tracks from spotify response body
    getTracksFromResponse(response) {
        return response?.body?.items;
    }

    getTrackFromResponse(response) {
        return response?.body ?? {};
    }

    // Function that inserts formatted tracks into the database
    async insert(tracks) {
        return await prisma.track.createMany({
            data: this.formatTracksForDatabase(tracks),
            skipDuplicates: true,
        });
    }

    // Function that return track info from spotify and the database
    // The function returns an object with the following properties:
    // - name: name of the track
    // - artist: name of the artist
    // - album: name of the album
    // - rating: rating of the track
    // - preview_url: preview url of the track
    // - user_has_voted: boolean that indicates if the user has voted for the track
    // - album_image: url of the album cover
    async formatTrackForInfoPage(track_id, user_id, req) {
        const track = await this.getTrackFromSpotify(track_id, req);
        const album = await this.getAlbum(track);
        const artist = await this.getArtist(track);
        const rating = await this.getRating(track);
        const user_has_voted = await new Vote().hasUserVotedForTrack(
            track?.id,
            user_id
        );

        return {
            name: track?.name,
            artist: artist?.name,
            album: album?.name,
            rating: rating,
            preview_url: track?.preview_url,
            user_has_voted: user_has_voted,
            album_image: album?.images?.[0]?.url,
        };
    }

    // Function that returns the rating of a track
    async getRating(track) {
        const rating = await prisma.track.findUnique({
            where: {
                spotify_id: track?.id,
            },
        });

        return rating?.rating ?? 1500;
    }

    // Function that returns a track from spotify
    async getTrackFromSpotify(track_id, req) {
        const session = await getSession({ req: req });
        const spotifyApi = await serverSpotify(session);
        return this.getTrackFromResponse(await spotifyApi.getTrack(track_id));
    }
}

export default Track;
