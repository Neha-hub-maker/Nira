import firstImage from '../../../assets/hero/hero_01_image.jpg';
import secondImage from '../../../assets/hero/hero_02_image.jpg';
import thirdImage from '../../../assets/hero/hero_03_image.jpg';
import video from '../../../assets/hero/hero_video.mp4';

// Vite resolves these repository files into development and hashed build URLs.
// Originals remain untouched; the video URL is attached only on its first visit.
export const heroMedia = [
  { type: 'image', src: firstImage, label: 'Photograph 1', width: 5472, height: 3648 },
  { type: 'image', src: secondImage, label: 'Photograph 2', width: 3840, height: 2160 },
  { type: 'image', src: thirdImage, label: 'Photograph 3', width: 5760, height: 3840 },
  { type: 'video', src: video, label: 'Video' },
];
