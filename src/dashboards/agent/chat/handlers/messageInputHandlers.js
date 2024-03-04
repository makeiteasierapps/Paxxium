import { processToken } from '../../utils/processToken';

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
    getMessages,
    idToken,
    chatId,
    chatSettings,
    insideCodeBlock,
    setInsideCodeBlock,
    ignoreNextTokenRef,
    languageRef,
    setMessages,
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
                    console.log(data);
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

    const convoHistory = await getMessages(chatId);

    const dataPacket = {
        chatSettings,
        userMessage,
        convoHistory,
        image_url: imageUrl,
    };

    const response = await fetch(`${backendUrl}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: idToken,
        },
        credentials: 'include',
        body: JSON.stringify(dataPacket),
    });

    if (response.body) {
        const reader = response.body.getReader();
        while (true) {
            const { done, value } = await reader.read();
            if (done) {
                break;
            }
            const decodedValue = new TextDecoder('utf-8').decode(value);
            // Split the decoded value by newline and filter out any empty lines
            const jsonChunks = decodedValue
                .split('\n')
                .filter((line) => line.trim() !== '');
            try {
                jsonChunks.forEach((chunk) => {
                    const messageObj = JSON.parse(chunk);
                    processToken(
                        messageObj,
                        setInsideCodeBlock,
                        insideCodeBlock,
                        setMessages,
                        chatId,
                        ignoreNextTokenRef,
                        languageRef
                    );
                });
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        }
    } else {
        console.log('No response body');
    }
};
