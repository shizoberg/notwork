export async function compressProfilePhoto(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Lütfen bir fotoğraf seç.");
  if (file.size > 12 * 1024 * 1024) throw new Error("Fotoğraf en fazla 12 MB olabilir.");

  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const element = new Image();
    const objectUrl = URL.createObjectURL(file);
    element.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(element);
    };
    element.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Fotoğraf okunamadı."));
    };
    element.src = objectUrl;
  });

  const size = Math.min(image.naturalWidth, image.naturalHeight);
  const sourceX = Math.max(0, (image.naturalWidth - size) / 2);
  const sourceY = Math.max(0, (image.naturalHeight - size) / 2);
  const canvas = document.createElement("canvas");
  canvas.width = 720;
  canvas.height = 720;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Fotoğraf işlenemedi.");
  context.drawImage(image, sourceX, sourceY, size, size, 0, 0, 720, 720);

  for (const quality of [0.84, 0.74, 0.64]) {
    const dataUrl = canvas.toDataURL("image/jpeg", quality);
    if (dataUrl.length < 900_000) return dataUrl;
  }
  throw new Error("Fotoğraf küçültülemedi. Başka bir fotoğraf dene.");
}
