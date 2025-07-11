import {
  AVATAR_UPLOAD_PRESET,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_URL,
} from '@env';
import Toast from 'react-native-toast-message';
import { v4 as uuidv4 } from 'uuid';

const uploadAvatar = async (avatar: string | undefined): Promise<string | undefined> => {
  if (!avatar || avatar.startsWith('http')) return avatar;

  const filename = `avatar_${uuidv4()}.jpg`;
  const formData = new FormData();

  formData.append('file', {
    uri: avatar,
    name: filename,
    type: 'image/jpeg',
  } as any);

  formData.append('upload_preset', AVATAR_UPLOAD_PRESET);

  try {
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const data = await response.json();

    if (data.secure_url) {
      return data.secure_url;
    } else {
      Toast.show({
        type: 'error',
        text1: 'Upload failed',
        text2: 'Could not upload your avatar. Try again later.',
      });
    }
  } catch (err) {
    console.error('Cloudinary upload error:', err);
    Toast.show({
      type: 'error',
      text1: 'Upload error',
      text2: 'Something went wrong while uploading your avatar.',
    });
  }

  return undefined;
};

const deleteAvatar = async (avatarUri: string) => {
  const avatar_parts: string[] = avatarUri.split('/');
  const avatar_id: string = avatar_parts[avatar_parts.length - 1].slice(0, -4);

  try {
    await fetch(
      `https://${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}@api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image/upload?public_ids=${[avatar_id]}`,
      { method: 'DELETE' }
    );
    return true;
  } catch (error: any) {
    Toast.show({ type: 'error', text1: 'Problem deleting photo', text2: error.message || error });
    return false;
  }
};

export { deleteAvatar, uploadAvatar };
