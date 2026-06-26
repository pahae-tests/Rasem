export async function sendMail({ to, subject, text, html }) {
  const url = new URL("https://pahae-utils.vercel.app/api/mail");
  url.searchParams.set("email", to);
  url.searchParams.set("subject", subject);
  url.searchParams.set("text", text);
  url.searchParams.set("html", html);

  const res = await fetch(url.toString());
  return res.ok;
}
