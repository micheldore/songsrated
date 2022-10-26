import signIn from 'next-auth/react';
import SpotifyWebApi from 'spotify-web-api-node';
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
    clientSecret: process.env.NEXT_PUBLIC_CLIENT_SECRET,
});

async function serverSpotify(session) {
    if (session) {
        // If refresh access token attempt fails, direct user to login...
        if (session.error === 'RefreshAccessTokenError') {
            signIn();
        }
        spotifyApi.setAccessToken(session.user.accessToken);
    }

    return spotifyApi;
}
export default serverSpotify;
