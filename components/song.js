import { useState } from "react";
import { BiUpvote, BiPlay, BiPause } from "react-icons/bi";
import ReactAudioPlayer from "react-audio-player";

export default function Song({ ...props }) {
    const [player, setSongPlayer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    function changePlayState() {
        if (isPlaying) {
            player.pause();
        } else {
            player.play();
        }
        setIsPlaying(!isPlaying);
    }

    const track = props.track;
    return (
        <>
            <div className="md:px-10 py-2">
                <div className="flex flex-col rounded-sm">
                    <div>
                        <div className="flex flex-row items-center justify-between">
                            <div
                                class="img-gradient flex-col items-center justify-between"
                                onClick={changePlayState}
                            >
                                <div className="vote-image-wrapper">
                                    <img
                                        className="vote-play-button"
                                        src={
                                            isPlaying
                                                ? "pause_button.png"
                                                : "play_button.png"
                                        }
                                        alt=""
                                    />
                                </div>
                                <div class="vote-title-wrapper">
                                    <span className="vote-song">
                                        {track?.name}
                                    </span>
                                    <span className="vote-artist">
                                        {track?.artist_name}
                                    </span>
                                </div>
                                <img
                                    className="vote-img"
                                    src={track?.album_image}
                                />
                            </div>
                        </div>
                        {/* <div className="bg-slate-700 py-2 text-white text-xl px-2">
                            {track?.name} - {track?.artist_name}
                        </div>

                        <div className="h-full flex flex-row display-block">
                            <div
                                className="h-full w-100 position-relative display-block"
                                style={{ position: "relative" }}
                            >
                                <img
                                    onClick={changePlayState}
                                    src={track?.album_image}
                                    layout="fill"
                                    className="w-full h-auto display-block"
                                />
                                <div
                                    className="position-absolute bottom-0 playpause"
                                    onClick={changePlayState}
                                >
                                    <BiPause
                                        visibility={
                                            isPlaying ? "visible" : "hidden"
                                        }
                                        style={{ position: "absolute" }}
                                        className="text-white bg-gray-500/70 w-20 h-20"
                                    />
                                    <BiPlay
                                        visibility={
                                            isPlaying ? "hidden" : "visible"
                                        }
                                        style={{ position: "absolute" }}
                                        className="text-white bg-gray-500/70 w-20 h-20"
                                    />
                                </div>
                            </div>
                            <div className="md:hidden bg-white sepia p-2 min-w-0 w-full text-left">
                                <table className="table-auto">
                                    <tbody>
                                        <tr>
                                            <th>Album:</th>
                                            <td className="min-w-0 flex-shrink-0 text-ellipsis overflow-hidden whitespace-nowrap">
                                                {track?.album_name}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Year:</th>
                                            <td>
                                                {new Date(
                                                    track?.release_date
                                                ).getFullYear()}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Rank:</th>
                                            <td>#3</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div> */}
                        <ReactAudioPlayer
                            src={track?.preview_url}
                            ref={(element) => {
                                setSongPlayer(element?.audioEl?.current);
                            }}
                            controls
                            loop
                            className="w-full hidden"
                        />
                    </div>
                    <button
                        className="w-full flex flex-row justify-center bg-slate-100 py-1"
                        onClick={() => {
                            props.set(track?.spotify_id);
                        }}
                    >
                        <div className="block">
                            <BiUpvote className="inline align-middle" />
                        </div>
                        <span>Pick this song</span>
                    </button>
                </div>
            </div>
        </>
    );
}
