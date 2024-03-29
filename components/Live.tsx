import {
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
} from '@/liveblocks.config';
import LiveCursors from './cursor/LiveCursors';
import { useCallback, useEffect, useState } from 'react';
import CursorChat from './cursor/CursorChat';
import { CursorMode, CursorState, Reaction } from '@/types/type';
import ReactionSelector from './reaction/ReactionButton';
import FlyingReaction from './reaction/FlyingReaction';
import useInterval from '@/hooks/useInterval';
import { Comments } from './comments/Comments';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import { shortcuts } from '@/constants';

interface Props {
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  undo: () => void;
  redo: () => void;
}

const Live: React.FC<Props> = ({ canvasRef, undo, redo }) => {
  const broadcast = useBroadcastEvent();

  const [{ cursor }, updateMyPresence] = useMyPresence();
  const [cursorState, setCursorState] = useState<CursorState>({
    mode: CursorMode.Hidden,
  });
  const [reactions, setReactions] = useState<Reaction[]>([]);

  useEffect(() => {
    const onKeyUp = (event: KeyboardEvent) => {
      if (event.key === '/') {
        setCursorState({
          mode: CursorMode.Chat,
          previousMessage: null,
          message: '',
        });
      } else if (event.key === 'Escape') {
        updateMyPresence({ message: '' });
        setCursorState({ mode: CursorMode.Hidden });
      } else if (event.key === 'e') {
        setCursorState({ mode: CursorMode.ReactionSelector });
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === '/') {
        event.preventDefault();
      }
    };
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('keydown', onKeyDown);
    };
  }, [updateMyPresence]);

  const createReaction = (x: number, y: number, value: string) => ({
    point: { x, y },
    value,
    timestamp: Date.now(),
  });

  useInterval(() => {
    const thresholdTimestamp = Date.now() - 4000;
    setReactions(reactions =>
      reactions.filter(({ timestamp }) => timestamp > thresholdTimestamp)
    );
  }, 1000);

  useInterval(() => {
    if (
      cursorState.mode === CursorMode.Reaction &&
      cursorState.isPressed &&
      cursor
    ) {
      setReactions(prevState => [
        ...prevState,
        createReaction(cursor.x, cursor.y, cursorState.reaction),
      ]);
      broadcast(createReaction(cursor.x, cursor.y, cursorState.reaction));
    }
  }, 100);

  useEventListener(eventData => {
    const event = eventData.event;

    setReactions(prevState => [
      ...prevState,
      createReaction(event.point.x, event.point.y, event.value),
    ]);
  });

  const calculateCoordinates = (event: React.PointerEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.x;
    const y = event.clientY - rect.y;
    return { x, y };
  };

  const handlePointerMove = useCallback(
    (event: React.PointerEvent) => {
      event.preventDefault();

      if (cursor === null || cursorState.mode !== CursorMode.ReactionSelector) {
        const { x, y } = calculateCoordinates(event);
        updateMyPresence({ cursor: { x, y } });
      }
    },
    [updateMyPresence, cursor, cursorState.mode]
  );

  const handlePointerLeave = useCallback(() => {
    setCursorState({ mode: CursorMode.Hidden });
    updateMyPresence({ cursor: null, message: null });
  }, [updateMyPresence]);

  const handlePointerDown = useCallback(
    (event: React.PointerEvent) => {
      const { x, y } = calculateCoordinates(event);
      updateMyPresence({ cursor: { x, y } });

      setCursorState((prevState: CursorState) =>
        cursorState.mode === CursorMode.Reaction
          ? { ...prevState, isPressed: true }
          : prevState
      );
    },
    [updateMyPresence, cursorState.mode]
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent) => {
      const { x, y } = calculateCoordinates(event);
      updateMyPresence({ cursor: { x, y } });

      setCursorState((prevState: CursorState) =>
        cursorState.mode === CursorMode.Reaction
          ? { ...prevState, isPressed: true }
          : prevState
      );
    },
    [updateMyPresence, cursorState.mode]
  );

  const setReaction = useCallback((reaction: string) => {
    setCursorState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  const handleContextMenuClick = useCallback(
    (shortcut: string) => {
      switch (shortcut) {
        case 'Chat':
          setCursorState({
            mode: CursorMode.Chat,
            previousMessage: null,
            message: '',
          });
          break;
        case 'Undo':
          undo();
          break;
        case 'Redo':
          redo();
          break;
        case 'Reactions':
          setCursorState({
            mode: CursorMode.ReactionSelector,
          });
          break;
        default:
          break;
      }
    },
    [undo, redo]
  );

  return (
    <ContextMenu>
      <ContextMenuTrigger
        id="canvas"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        className="relative h-full w-full flex flex-1 justify-center items-center"
      >
        <canvas ref={canvasRef} />

        {reactions.map(reaction => (
          <FlyingReaction
            key={reaction.timestamp.toString()}
            x={reaction.point.x}
            y={reaction.point.y}
            timestamp={reaction.timestamp}
            value={reaction.value}
          />
        ))}
        {cursor && (
          <CursorChat
            cursor={cursor}
            cursorState={cursorState}
            setCursorState={setCursorState}
            updateMyPresence={updateMyPresence}
          />
        )}
        {cursorState.mode === CursorMode.ReactionSelector && (
          <ReactionSelector setReaction={setReaction} />
        )}
        <LiveCursors />
        <Comments />
      </ContextMenuTrigger>
      <ContextMenuContent className="right-menu-content">
        {shortcuts.map(shortcut => (
          <ContextMenuItem
            key={shortcut.key}
            onClick={() => handleContextMenuClick(shortcut.name)}
            className="right-menu-item"
          >
            <p>{shortcut.name}</p>
            <p className="text-xs text-primary-grey-300">{shortcut.shortcut}</p>
          </ContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  );
};

export default Live;
