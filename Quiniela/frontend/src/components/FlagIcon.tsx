import { ReactElement } from 'react';
import { Theme } from '../Theme';

interface IFlagIconProps {
  countryCode: string;
  alt: string;
  size?: 'sm' | 'md';
}

export const FlagIcon = ({
  countryCode,
  alt,
  size = 'md'
}: IFlagIconProps): ReactElement => {
  const width: number = size === 'sm' ? 24 : 40;
  const code: string = countryCode.toLowerCase();
  return (
    <img
      src={`https://flagcdn.com/w40/${code}.png`}
      alt={alt}
      width={width}
      height={Math.round(width * 0.7)}
      crossOrigin="anonymous"
      style={{
        objectFit: 'cover',
        borderRadius: Theme.Radii.sm,
        border: `1px solid ${Theme.Colors.outlineVariant}`,
        boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
      }}
    />
  );
};
