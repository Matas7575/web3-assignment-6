import "../styles/globals.css";
import type { AppProps } from "next/app";
import { UserProvider } from "../context/UserContext";

/**
 * Custom App component to initialize pages.
 * 
 * @param {AppProps} props - The properties for the App component.
 * @returns {JSX.Element} - The rendered App component.
 */
export default function App({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <Component {...pageProps} />
    </UserProvider>
  );
}