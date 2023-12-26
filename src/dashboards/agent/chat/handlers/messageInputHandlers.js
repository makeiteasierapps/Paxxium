function resizeImage(file, maxWidth, maxHeight, callback) {
    const img = document.createElement('img');
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

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

export const sendMessage = async (
    input,
    uid,
    backendUrl,
    addMessage,
    socketRef,
    idToken,
    chatId,
    agentModel,
    image = null
) => {
    let imageUrl = null;
    if (image) {
        imageUrl = await new Promise((resolve) => {
            resizeImage(image, 400, 400, async function (resizedImageBlob) {
                const formData = new FormData();

                formData.append('image', resizedImageBlob, 'image.png');
                const response = await fetch(`${backendUrl}/messages/utils`, {
                    method: 'POST',
                    headers: {
                        Authorization: idToken,
                    },
                    credentials: 'include',
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    resolve(data.fileUrl); // Resolve the Promise with the imageUrl
                } else {
                    resolve(null); // Resolve the Promise with null if the response is not ok
                }
            });
        });
    }

    // Optimistic update
    const userMessage = {
        content: input,
        message_from: 'user',
        user_id: uid,
        time_stamp: new Date().toISOString(),
        type: 'database',
        image_url: imageUrl,
    };

    addMessage(chatId, userMessage);

    // Emit the 'message' event to the server
    socketRef.current.emit('message', {
        idToken: idToken,
        chatId: chatId,
        content: input,
        message_from: 'user',
        user_id: uid,
        agentModel: agentModel,
        image_url: imageUrl,
    });
};
