import { BaseUserMeta, User } from '@liveblocks/client';
import { Presence } from '@/liveblocks.config';
import { FC } from 'react';
import Cursor from './Cursor';
import { COLORS } from '@/constants';

const LiveCursors: FC<{ others: readonly User<Presence, BaseUserMeta>[] }> = ({
  others,
}) => {
  return others.map(({ connectionId, presence }) => {
    if (!presence?.cursor) return null;

    return (
      <Cursor
        key={connectionId}
        color={COLORS[Number(connectionId) % COLORS.length]}
        x={presence.cursor.x}
        y={presence.cursor.y}
        message={presence.message}
      />
    );
  });
};

export default LiveCursors;
