import Track from "./Track";
import prisma from "../db";

class Album {
    constructor() {
        this.track = new Track();
    }

    // Function that formats a track object from spotify for insertion into the database
    formatAlbumForDatabase(album) {
        return {
            spotify_id: album?.id,
            name: album?.name,
            artist_id: album?.artists?.[0]?.id,
            release_date: new Date(album?.release_date),
        };
    }

    // Format a list of tracks to a list of albums for insertion into the database
    async formatTracksToAlbumsForDatabase(tracks) {
        var formattedAlbums = [];

        for (const track of tracks) {
            const album = await this.track.getAlbum(track);
            formattedAlbums.push(this.formatAlbumForDatabase(album));
        }

        return formattedAlbums;
    }

    // Function that inserts formatted albums into the database
    async insert(tracks) {
        return await prisma.album.createMany({
            data: await this.formatTracksToAlbumsForDatabase(tracks),
            skipDuplicates: true,
        });
    }
}

export default Album;
