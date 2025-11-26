/**
 * Merges the captured user photo with a pre-defined taco-themed background template.
 * This simulates a branded photo booth strip or social media post.
 */
export const processImageWithTemplate = async (base64Image: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const userImage = new Image();

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    userImage.onload = () => {
      // Define final output dimensions (e.g., 1080x1350 for Instagram Portrait)
      const width = 1080;
      const height = 1350;

      canvas.width = width;
      canvas.height = height;

      // 1. Fill Background (Brand Colors)
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, '#F59E0B'); // Amber 500
      gradient.addColorStop(1, '#EF4444'); // Red 500
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Decorative Patterns (Circles)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const r = Math.random() * 50 + 20;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw the User Photo (Polaroid Style)
      const photoWidth = 900;
      const photoHeight = 900; // Square crop aspect
      const photoX = (width - photoWidth) / 2;
      const photoY = 150;

      // Draw white frame/shadow
      ctx.fillStyle = '#FFFFFF';
      ctx.shadowColor = 'rgba(0,0,0,0.3)';
      ctx.shadowBlur = 20;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 10;
      ctx.fillRect(photoX - 20, photoY - 20, photoWidth + 40, photoHeight + 180);
      
      // Reset shadow for image
      ctx.shadowColor = 'transparent';

      // Draw user image (Crop to square logic)
      const minDim = Math.min(userImage.width, userImage.height);
      const sx = (userImage.width - minDim) / 2;
      const sy = (userImage.height - minDim) / 2;

      ctx.drawImage(
        userImage,
        sx, sy, minDim, minDim, // Source crop
        photoX, photoY, photoWidth, photoHeight // Dest coords
      );

      // 4. Add Overlay Text/Branding
      ctx.fillStyle = '#1F2937'; // Dark Gray
      ctx.textAlign = 'center';
      
      // Title
      ctx.font = 'bold 60px sans-serif';
      ctx.fillText("TACO TUESDAY", width / 2, photoY + photoHeight + 80);

      // Subtitle
      ctx.fillStyle = '#EF4444'; // Red
      ctx.font = 'italic 30px sans-serif';
      ctx.fillText("#TacoLife", width / 2, photoY + photoHeight + 130);

      // 5. Add a "Sticker" emoji (simulated)
      ctx.font = '100px serif';
      ctx.fillText("🌮", width - 150, 140);
      ctx.fillText("🌮", 150, 140);

      resolve(canvas.toDataURL('image/jpeg', 0.9));
    };

    userImage.onerror = (err) => {
      reject(err);
    };

    userImage.src = base64Image;
  });
};