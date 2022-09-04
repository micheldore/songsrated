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
        showLoadingAnimation();
        getTracks();
    }, []);

    useEffect(() => {
        if (!loading) {
            Swal.close();
        } else {
            showLoadingAnimation();
        }
    }, [loading]);

    async function showLoadingAnimation() {
        setLoading(true);
        Swal.fire({
            title: "Loading new songs",
            html: "Alright! Let's compare some new songs",
            didOpen: () => {
                Swal.showLoading();
            },
            allowEscapeKey: false,
            allowOutsideClick: false,
        });
    }

    async function showInfoModal() {
        Swal.fire({
            title: "How to use this app",
            html: `
                <p>Here you can compare two songs from your Spotify library and choose which one you like more.</p>
                <p>After you choose a song, a new pair of songs will be loaded.</p>
                <p>When you have compared all the songs in your library, you will be notified.</p>
            `,
            icon: "info",
            confirmButtonText: "Ok",
        });
    }

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
            <div className="flex min-h-screen min-w-screen flex-col items-center justify-center">
                <Head>
                    <title>Songsrated</title>
                    <link rel="icon" href="/favicon.ico" />
                    <link
                        rel="stylesheet"
                        href="https://unpkg.com/boxicons@latest/css/boxicons.min.css"
                    ></link>
                </Head>

                <main className="flex w-full flex-1 flex-col items-center justify-center pb-10 pt-10 text-center">
                    <div>
                        <i
                            class="bx bx-md bxs-info-square info-button"
                            onClick={showInfoModal}
                        ></i>
                        <i
                            class="bx bx-md bxs-exit logout-button"
                            onClick={signOut}
                        ></i>
                    </div>
                    <h1 className="text-xl font-bold min-w-full px-0 vote-title">
                        SONGSRATED
                    </h1>

                    <div
                        className="md:flex md:flex-row display-block"
                        style={{ width: "60%" }}
                    >
                        <Song track={track1} set={setWinner} />
                        <Song track={track2} set={setWinner} />
                    </div>

                    <div
                        className="flex flex-row items-center justify-evenly"
                        onClick={() => (window.location = "/ranking")}
                    >
                        <img src="arrow.png" />
                        <span className="pl-2 text-white return-text">
                            Return to rating
                        </span>
                    </div>
                </main>
            </div>
        </>
    );
};

export default Home;
