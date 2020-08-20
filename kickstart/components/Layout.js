import Head from 'next/head'
import Navbar from './Navbar'

export default function Layout(props) {
    return (
        <>
            <Head>
                <meta charSet="utf-8"/>
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no"/>
                <title>Kick Kick Starter</title>
            </Head>
            <Navbar />

            {props.children}

        </>
    );
}