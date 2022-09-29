import { getProviders, signIn } from "next-auth/react";
import Swal from "sweetalert2";

// Function that generates a modal with a message that explains the data that is being collected
function DataCollectionModal() {
    Swal.fire({
        title: "Data Collection",
        html: `
            <p class='text-left'>
            We need your Spotify account to get your music library and to
            play the songs.
            </p>
            <br>
            <p class='text-left'>
            We want to be transparent. Therefore, we want to explain what data we collect and why we collect it.
            The Spotify data that we collect is:
            </p>
            <ul class='text-left'>
                <li>- Your Spotify username</li>
                <li>- Your Spotify email address</li>
                <li>- Your library songs</li>
                <li>- Your top 50 recently played songs</li>
            </ul>
            <br>
            <p class="text-left">
            We do not collect any other data from your Spotify.
            The data we collect is used to identify you and to track your votes.
            We will never send you any emails. We will
            never sell your data to anyone.
            </p>
            <br>
            <p class='text-left'>
            The only usage data that is collected is each vote that you cast
            and the time that you cast it. In order for the website to work and to
            calculate the rating.
            </p>`,
    });
}

function Login({ providers }) {
    return (
        <div className="flex flex-col w-full justify-center items-center min-h-screen">
            <span className="login-title">SONGSRATED</span>
            <span className="login-subtitle">What is the best song ever made?</span>
            <div className="login-text text-left">
                <p>
                    {/* Text to explain what this website does and why it is awesome: */}
                    This website allows you to compare two songs from your
                    Spotify music library.
                </p>
                <br />
                <p>
                    {/* Text to explain how to use this website: */}
                    To get started, click on the button below and login with
                    your Spotify account.
                </p>
                <br />
            </div>
            <p class="data-text">
                <a href="#" onClick={DataCollectionModal}>
                    Want to know more about how we use your data? Click here
                </a>
                .
            </p>

            {Object.values(providers).map((provider) => {
                return (
                    <div key={provider.name}>
                        <button
                            onClick={() =>
                                signIn(provider.id, { callbackUrl: "/" })
                            }
                        >
                            <div className="flex flex-row py-4 items-center justify-center rounded-sm bg-black w-80 login-button">
                                <img
                                    src="logo_spotify.png"
                                    className="h-10 w-10"
                                    alt=""
                                />
                                <span className="text-white pl-2">
                                    Login with {provider?.name}
                                </span>
                            </div>
                        </button>
                    </div>
                );
            })}
        </div>
    );
}
export default Login;

export async function getServerSideProps() {
    const providers = await getProviders();

    return {
        props: {
            providers,
        },
    };
}
