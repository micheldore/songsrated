import prisma from '../db';
import Track from './Track';

class Artist {
    constructor() {
        this.track = new Track();
    }

    // Function that formats an artist object from spotify for insertion into the database
    formatArtistForDatabase(artist) {
        return {
            spotify_id: artist?.id,
            name: artist?.name,
        };
    }

    // Format a list of tracks to a list of artists for insertion into the database
    async formatTracksToArtistsForDatabase(tracks) {
        var formattedArtists = [];

        for (const track of tracks) {
            const artist = await this.track.getArtist(track);
            formattedArtists.push(this.formatArtistForDatabase(artist));
        }

        return formattedArtists;
    }

    // Function that inserts formatted artists into the database
    async insert(tracks) {
        return await prisma.artist.createMany({
            data: await this.formatTracksToArtistsForDatabase(tracks),
            skipDuplicates: true,
        });
    }
}

export default Artist;
