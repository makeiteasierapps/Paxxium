export const resizeImage = (file, maxWidth, maxHeight, callback) => {
    const img = document.createElement("img");
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
  
    img.onload = function () {
      let width = img.width;
      let height = img.height;
  
      // calculate the width and height, constraining the proportions
      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }
  
      canvas.width = width;
      canvas.height = height;
  
      // draw the image
      ctx.drawImage(img, 0, 0, width, height);
  
      canvas.toBlob(callback, file.type);
    };
  
    img.src = URL.createObjectURL(file);
  }
  