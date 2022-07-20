import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import Image from "next/image";
import { useEffect, useState } from "react";
import useSpotify from "../hooks/useSpotify";
import Song from "../components/song";

const Home = () => {
    const { data: session } = useSession();
    const spotifyApi = useSpotify();
    const [topTracks, setTopTracks] = useState([]);

    useEffect(() => {
        async function getTopTracks() {
            const top50 =
                (await spotifyApi.getMyTopTracks({ limit: 50, offset: 0 }))
                    ?.body?.items ?? [];
            const top100 = top50.concat(
                (await spotifyApi.getMyTopTracks({ offset: 50 }))?.body
                    ?.items ?? []
            );
            setTopTracks(top100);
        }

        if (spotifyApi?.getAccessToken()) {
            console.log(spotifyApi?.getAccessToken());
            getTopTracks();
        }
    }, [spotifyApi?.getAccessToken()]);

    return (
        <>
            <div className="flex min-h-screen min-w-screen flex-col items-center justify-center bg-amber-200">
                <Head>
                    <title>Songsrated</title>
                    <link rel="icon" href="/favicon.ico" />
                </Head>

                <main className="flex w-full flex-1 flex-col items-center justify-center px-5 text-center">
                    <h1 className="text-xl font-bold min-w-full px-0 bg-amber-200">
                        Welcome to Songsrated, {session?.user?.name}!
                    </h1>

                    <div className="md:flex md:flex-row display-block">
                        {get2RandomSongsFromTopTracks().map((track) => {
                            return <Song track={track} />;
                        })}
                    </div>

                    <button onClick={() => signOut()}>Logout</button>
                </main>
            </div>
        </>
    );

    function get2RandomSongsFromTopTracks(n = 2) {
        const shuffled = topTracks.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, n);
    }
};

export default Home;
