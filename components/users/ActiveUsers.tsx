import { useMemo } from 'react';
import Avatar from './Avatar';
import { useOthers, useSelf } from '@/liveblocks.config';
import { generateRandomName } from '@/lib/utils';
import styles from './ActiveUsers.module.css';

const ActiveUsers = () => {
  const users = useOthers();
  const currentUser = useSelf();

  const userAvatars = useMemo(() => {
    return users
      .slice(0, 3)
      .map(user => (
        <Avatar
          key={user.connectionId}
          name={generateRandomName()}
          otherStyles="-ml-3 border-4 border-white"
        />
      ));
    // eslint-disable-next-line
  }, [users.length]);

  const currentUserAvatar = useMemo(() => {
    return (
      <Avatar
        key="currentUser"
        name="You"
        otherStyles="border-[3px] border-4 border-primary-green"
      />
    );
  }, []);

  const moreUsersIndicator = useMemo(() => {
    return (
      <div className={`${styles.more} font-semibold`}>+{users.length - 3}</div>
    );
  }, [users.length]);

  return (
    <div className="flex items-center justify-center gap-1 py-2">
      <div className="flex pl-3 mr-2">
        {currentUser && currentUserAvatar}
        {userAvatars}
        {users.length > 3 && moreUsersIndicator}
      </div>
    </div>
  );
};

export default ActiveUsers;
