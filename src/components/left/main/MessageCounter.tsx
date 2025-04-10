import type { FC } from '../../../lib/teact/teact';
import React, { useEffect, useRef, useState } from '../../../lib/teact/teact';

import type { ApiChat, ApiUser } from '../../../api/types';

import { fetchMessages } from '../../../api/gramjs/methods';

type MessageCounterProps = {
  chat: ApiChat;
  user: ApiUser | undefined;
  className: string;
};

const MessageCounter: FC<MessageCounterProps> = ({ chat, user, className }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [messageCount, setMessageCount] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  // eslint-disable-next-line no-null/no-null
  const containerRef = useRef<HTMLDivElement | null >(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 },
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    console.log(`${isVisible} видимость`);
    return () => {
      if (containerRef.current) {
        // eslint-disable-next-line react-hooks-static-deps/exhaustive-deps
        observer.unobserve(containerRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) {
      return;
    }
    console.log(`${chat.id} функция`);
    const getMessages = async () => {
      const [result] = await Promise.all([fetchMessages({ chat, limit: 100 })]);
      console.log(result?.messages);
      return result?.messages.filter((msg) => msg.senderId === user?.id).length;
    };

    setLoading(true);
    getMessages()
      .then((count) => {
        setMessageCount(count ?? 0);
      }).finally(() => setLoading(false));
  }, [isVisible, chat, user?.id]);

  return (
    <div className={className} ref={containerRef}>
      <p>Test</p>
      {loading ? 'Загрузка...' : `Количество сообщений: ${messageCount}`}
    </div>
  );
};

export default MessageCounter;
