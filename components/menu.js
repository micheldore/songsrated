import { signOut } from 'next-auth/react';
import Head from 'next/head';
import Swal from 'sweetalert2';

export default function Menu({ ...props }) {
    return (
        <>
            <Head>
                <title>SONGS RATED</title>
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1"
                ></meta>
                <link rel="icon" href="/favicon.ico" />
                <link
                    rel="stylesheet"
                    href="https://unpkg.com/boxicons@latest/css/boxicons.min.css"
                ></link>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link
                    rel="preconnect"
                    href="https://fonts.gstatic.com"
                    crossorigin
                />
                <link
                    href="https://fonts.googleapis.com/css2?family=Roboto&display=swap"
                    rel="stylesheet"
                />
            </Head>
            <div className="pb-7">
                <i
                    className="bx bx-md bxs-info-square info-button"
                    onClick={showInfoModal}
                ></i>

                <i
                    className="bx bx-md bxs-playlist playlist-button"
                    onClick={() => (window.location = '/ranking')}
                ></i>

                <i
                    className="bx bx-md bxs-upvote upvote-button"
                    onClick={() => (window.location = '/')}
                ></i>
                <i
                    className="bx bx-md bxs-downvote downvote-button"
                    onClick={() => (window.location = '/')}
                ></i>
                <i
                    className="bx bx-md bxs-exit logout-button"
                    onClick={signOut}
                ></i>
            </div>
            <h1 className="text-xl font-bold min-w-full px-0 vote-title">
                SONGS RATED
            </h1>
        </>
    );

    async function showInfoModal() {
        Swal.fire({
            title: 'How to use this app',
            html: `
                <p>Here you can compare two songs from your Spotify library and choose which one you like more.</p><br>
                <p>After you choose a song, a new pair of songs will be loaded.</p><br>
                <p>When you have compared all the songs in your library, you will be notified.</p>
            `,
            icon: 'info',
            confirmButtonText: 'Ok',
        });
    }
}
