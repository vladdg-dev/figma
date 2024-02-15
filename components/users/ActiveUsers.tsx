import { useMemo } from 'react';
import Avatar from './Avatar';
import { useOthers, useSelf } from '@/liveblocks.config';
import { generateRandomName } from '@/lib/utils';
import styles from './ActiveUsers.module.css';

const ActiveUsers = () => {
  const users = useOthers();
  const currentUser = useSelf();
  const hasMoreUsers = users.length > 3;

  const renderedUsers = useMemo(() => {
    const userAvatars = users
      .slice(0, 3)
      .map(user => (
        <Avatar
          key={user.connectionId}
          name={generateRandomName()}
          otherStyles="-ml-3 border-4 border-white"
        />
      ));

    return (
      <div className="flex items-center justify-center gap-1 py-2">
        <div className="flex pl-3 mr-2">
          {currentUser && (
            <Avatar
              name="You"
              otherStyles="border-[3px] border-4 border-primary-green"
            />
          )}
          {userAvatars}
          {hasMoreUsers && (
            <div className={`${styles.more} font-semibold`}>
              +{users.length - 3}
            </div>
          )}
        </div>
      </div>
    );
  }, [users.length]);

  return renderedUsers;
};

export default ActiveUsers;
