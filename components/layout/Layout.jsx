import Head from "next/head";
import Navbar from "./Navbar";
import Footer from "./Footer";

export default function Layout({ children, title = "رسم - متجر الرسومات الفنية الأصيلة" }) {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="متجر رسم - اكتشف وامتلك أجمل الرسومات الفنية الأصيلة" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </>
  );
}
