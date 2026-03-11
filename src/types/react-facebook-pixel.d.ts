declare module 'react-facebook-pixel' {
  type PixelData = Record<string, unknown>;
  const ReactPixel: {
    init: (pixelId: string, advancedMatching?: PixelData, options?: PixelData) => void;
    pageView: () => void;
    track: (title: string, data?: PixelData) => void;
    trackCustom: (event: string, data?: PixelData) => void;
    grantConsent: () => void;
    revokeConsent: () => void;
  };
  export default ReactPixel;
}
