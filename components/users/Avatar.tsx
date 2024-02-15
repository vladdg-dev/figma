import Image from 'next/image';
import styles from './Avatar.module.css';
import { FC } from 'react';

const Avatar: FC<{ name: string; otherStyles: string }> = ({
  name,
  otherStyles,
}) => {
  return (
    <div
      className={`${styles.avatar} ${otherStyles} h-9 w-9`}
      data-tooltip={name}
    >
      <Image
        src={`https://liveblocks.io/avatars/avatar-${Math.floor(
          Math.random() * 30
        )}.png`}
        width={48}
        height={48}
        className={styles.avatar_picture}
        alt="avatar"
        priority
      />
    </div>
  );
};

export default Avatar;
