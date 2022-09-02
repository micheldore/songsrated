import { signOut, useSession } from "next-auth/react";
import Head from "next/head";
import { useEffect, useState } from "react";
import useSpotify from "../hooks/useSpotify";
import Song from "../components/song";
import Swal from "sweetalert2";

const Home = () => {
    const { data: session } = useSession();
    const spotifyApi = useSpotify();
    const [loading, setLoading] = useState(true);
    const [track1, setTrack1] = useState({});
    const [track2, setTrack2] = useState({});

    async function getTracks() {
        fetch("/api/get_two_tracks")
            .then((res) => res.json())
            .then((data) => {
                if (data.error) {
                    Swal.fire({
                        title: "No more tracks to compare",
                        text: "You have compared all the tracks in your library",
                        icon: "info",
                        confirmButtonText: "Ok",
                    });
                } else {
                    const [track1, track2] = data;
                    setTrack1(track1);
                    setTrack2(track2);
                    setLoading(false);
                }
            });
    }

    useEffect(() => {
        Swal.showLoading();
        getTracks();
    }, []);

    useEffect(() => {
        if (!loading) {
            Swal.close();
        } else {
            Swal.showLoading();
        }
    }, [loading]);

    async function setWinner(track_id) {
        setLoading(true);
        var winner_id = null;
        var loser_id = null;

        if (track_id == track1.spotify_id) {
            winner_id = track1?.spotify_id;
            loser_id = track2?.spotify_id;
        } else {
            winner_id = track2?.spotify_id;
            loser_id = track1?.spotify_id;
        }

        fetch("api/vote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                winner_id: winner_id,
                loser_id: loser_id,
            }),
        }).then((res) => getTracks());
    }

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
                        <Song track={track1} set={setWinner} />
                        <Song track={track2} set={setWinner} />
                    </div>

                    <button onClick={() => signOut()}>Logout</button>
                </main>
            </div>
        </>
    );
};

export default Home;
