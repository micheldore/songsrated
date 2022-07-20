import { useState } from "react";
import { BiUpvote } from "react-icons/bi";
import ReactAudioPlayer from "react-audio-player";

export default function Song({ ...props }) {
    const [player, setSongPlayer] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const track = props.track;
    return (
        <>
            <div className="md:px-10 py-2">
                <div class="flex flex-col border-2 border-amber-200 rounded-sm">
                    <div>
                        <div className="bg-slate-700 py-2 text-white text-xl px-2">
                            {track?.name} - {track?.artists?.[0]?.name}
                        </div>

                        <div className="h-32 md:h-full flex flex-row">
                            <img
                                onClick={() => {
                                    if (isPlaying) player.pause();
                                    else player.play();
                                    setIsPlaying(!isPlaying);
                                }}
                                src={track?.album?.images?.[0]?.url}
                                layout="fill"
                                className="h-32 md:h-full"
                            />
                            <div className="md:hidden bg-white p-2 w-full">
                                <table>
                                    <tbody>
                                        <tr>
                                            <th>Album:</th>
                                            <td>{track?.album?.name}</td>
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
