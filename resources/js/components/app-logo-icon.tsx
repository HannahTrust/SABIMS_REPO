import type { ImgHTMLAttributes } from 'react';

export const LOGO_SRC = '/logo.svg';

export default function AppLogoIcon({
    className,
    alt = 'eBarangayHub',
    ...props
}: ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img
            src={LOGO_SRC}
            alt={alt}
            className={className ?? 'h-full w-full object-contain'}
            {...props}
        />
    );
}
