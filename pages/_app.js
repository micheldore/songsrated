import "inter-ui/inter.css";
import "../styles/globals.css";
import "../styles/responsive-table.css";
import { SessionProvider } from "next-auth/react";
import {
    RecoilRoot,
    atom,
    selector,
    useRecoilState,
    useRecoilValue,
} from "recoil";

function MyApp({ Component, pageProps }) {
    return (
        <SessionProvider>
            <RecoilRoot>
                <Component {...pageProps} />
            </RecoilRoot>
        </SessionProvider>
    );
}

export default MyApp;
