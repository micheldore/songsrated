import { useEffect, useState } from "react";
import Song from "../components/song";
import Swal from "sweetalert2";
import Menu from "../components/menu";

const Home = () => {
    const [loading, setLoading] = useState(true);
    const [track1, setTrack1] = useState({});
    const [track2, setTrack2] = useState({});
    const [track1Playing, setTrack1Playing] = useState(false);
    const [track2Playing, setTrack2Playing] = useState(false);

    async function getTracks() {
        fetch("/api/get_two_tracks")
            .then((res) => res.json())
            .then((data) => {
                setTrack1Playing(false);
                setTrack2Playing(false);

                if (data.error) {
                    Swal.fire({
                        title:
                            data?.error ??
                            "No more tracks to compare in the database",
                        text: "No more tracks to compare. Please come back tomorrow to compare more tracks.",
                        icon: "info",
                        confirmButtonText: "Ok",
                        width: "80%",
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
        if (track1Playing) {
            setTrack2Playing(false);
        }
    }, [track1Playing]);

    useEffect(() => {
        if (track2Playing) {
            setTrack1Playing(false);
        }
    }, [track2Playing]);

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
                <main className="flex w-full flex-1 flex-col items-center justify-center pb-10 pt-10 text-center">
                    <Menu></Menu>

                    <div
                        className="md:flex md:flex-row display-block"
                        style={{ width: "60%" }}
                    >
                        <Song
                            track={track1}
                            set={setWinner}
                            isPlaying={track1Playing}
                            setParentPlayingStatus={setTrack1Playing}
                        />
                        <Song
                            track={track2}
                            set={setWinner}
                            isPlaying={track2Playing}
                            setParentPlayingStatus={setTrack2Playing}
                        />
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
