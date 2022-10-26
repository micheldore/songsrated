import prisma from '../db';

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

    // Function that inserts formatted tracks into the database
    async insert(tracks) {
        return await prisma.track.createMany({
            data: this.formatTracksForDatabase(tracks),
            skipDuplicates: true,
        });
    }
}

export default Track;
