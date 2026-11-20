export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Сервер отдаёт относительные пути вида "image/xxx.jpg" — дополняем до полного URL
export const serverAsset = (path?: string): string => (path ? `${API_URL}/${path}` : '');
