import { serveFile } from "jsr:@std/http/file-server";

async function renderStats(username: string) {
  const apiUrl = `https://api.listenbrainz.org/1/stats/user/${username}/recordings`;
  try {
    const res = await fetch(apiUrl);
    
    if (!res.ok) {
      return `<div id="error">Error: Could not fetch stats for ${username} (Status: ${res.status})</div>`;
    }

    const data = await res.json();
    const recordings = data.payload.recordings || [];

    let html = `<div id="most-listened-songs">`;
    recordings.forEach((rec: any) => {
      const trackUrl = `https://listenbrainz.org/track/${rec.recording_mbid}`;
      html += `<div><a href="${trackUrl}" target="#">${rec.track_name} - ${rec.artist_name}</a></div>`;
    });
    html += `</div>`;

    return html;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return `<div id="error">Internal Error: ${message}</div>`;
  }
}

Deno.serve(async (req: Request) => {
  const url = new URL(req.url);
  const path = url.pathname;

  if (path === "/" || path === "/index.html") {
    return serveFile(req, "./index.html");
  }

  if (path === "/favicon.ico") {
    return new Response(null, { status: 404 });
  }

  const username = path.slice(1);
  if (username && !username.includes(".")) {
    const html = await renderStats(username);
    return new Response(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  return serveFile(req, "./index.html");
});
