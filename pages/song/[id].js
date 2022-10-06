import Menu from "../../components/menu";
import { useRouter } from "next/router";
import SongInfo from "../../components/songinfo";
import { useState } from "react";
import { useEffect } from "react";

const Song = () => {
    const router = useRouter();
    const { id } = router.query;
    const [track, setTrack] = useState(null);

    function getTrackInfoById(id) {
        fetch(`/api/song?id=${id}`)
            .then((res) => res.json())
            .then((data) => {
                setTrack(data);
            });
    }

    useEffect(() => {
        if (id) {
            getTrackInfoById(id);
        }
    }, [id]);

    return (
        <>
            {track && (
                <div className="flex min-h-screen min-w-screen flex-col items-center justify-center">
                    <main className="pb-10 pt-10 text-center text-white">
                        <Menu></Menu>
                        <div>
                            <SongInfo track={track}></SongInfo>
                        </div>
                    </main>
                </div>
            )}
        </>
    );
};

export default Song;
