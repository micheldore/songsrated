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
                <div className="flex flex-col border-2 border-amber-200 rounded-sm">
                    <div>
                        <div className="bg-slate-700 py-2 text-white text-xl px-2">
                            {track?.name} - {track?.artists?.[0]?.name}
                        </div>

                        <div className="h-full flex flex-row display-block">
                            <div
                                className="h-full w-100 position-relative display-block"
                                style={{ position: "relative" }}
                            >
                                <img
                                    onClick={changePlayState}
                                    src={track?.album?.images?.[0]?.url}
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
                                                {track?.album?.name}
                                            </td>
                                        </tr>
                                        <tr>
                                            <th>Year:</th>
                                            <td>
                                                {new Date(
                                                    track?.album?.release_date
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
                        </div>
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
                    <button className="w-full flex flex-row justify-center bg-slate-100 py-5">
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
