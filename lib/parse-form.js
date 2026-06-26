import Busboy from "busboy";

export function parseForm(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = {};

    const busboy = Busboy({
      headers: req.headers,
      limits: { fileSize: 100 * 1024 * 1024 },
    });

    busboy.on("field", (name, val) => {
      fields[name] = val;
    });

    busboy.on("file", (name, file, info) => {
      const chunks = [];
      file.on("data", (chunk) => chunks.push(chunk));
      file.on("end", () => {
        files[name] = {
          buffer: Buffer.concat(chunks),
          mimetype: info.mimeType,
          filename: info.filename,
        };
      });
    });

    busboy.on("finish", () => resolve({ fields, files }));
    busboy.on("error", reject);

    req.pipe(busboy);
  });
}
