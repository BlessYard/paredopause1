import { RoomMember, RoomCheer, StudyRoom, SessionPhase } from '../types';

const STORAGE_ROOM_PREFIX = 'paretopause.room.';
const BROADCAST_CHANNEL_NAME = 'paretopause_live_study_rooms';

let broadcastChannel: BroadcastChannel | null = null;
if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
  try {
    broadcastChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  } catch (_) {}
}


export async function sendHeartbeat(
  roomId: string,
  member: Omit<RoomMember, 'status' | 'lastActive'>
): Promise<StudyRoom> {
  const now = Date.now();
  const currentMember: RoomMember = {
    ...member,
    lastActive: now,
    status: !member.isRunning
      ? 'paused'
      : member.phase === 'work'
      ? 'focusing'
      : 'resting',
  };

  // 1. Try server API
  try {
    const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(currentMember),
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (_) {
    // Server not available / offline: fallback to local + BroadcastChannel
  }

  // 2. Offline / BroadcastChannel Fallback
  return updateLocalRoomState(roomId, currentMember);
}

export async function sendRoomCheer(roomId: string, fromName: string, emoji: string): Promise<RoomCheer> {
  const cheer: RoomCheer = {
    id: `cheer-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    fromName,
    emoji,
    timestamp: Date.now(),
  };

  try {
    const res = await fetch(`/api/rooms/${encodeURIComponent(roomId)}/cheer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cheer),
    });
    if (res.ok) {
      return cheer;
    }
  } catch (_) {}

  // Broadcast fallback
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'CHEER', roomId, cheer });
  }

  // Update localStorage
  const existing = getLocalRoom(roomId);
  const updatedCheers = [cheer, ...(existing.recentCheers || [])].slice(0, 10);
  const updatedRoom = { ...existing, recentCheers: updatedCheers };
  saveLocalRoom(roomId, updatedRoom);

  return cheer;
}

export function subscribeToLocalRoomBroadcast(
  roomId: string,
  onUpdate: (room: StudyRoom) => void,
  onCheer: (cheer: RoomCheer) => void
): () => void {
  if (!broadcastChannel) return () => {};

  const handler = (event: MessageEvent) => {
    if (event.data?.roomId !== roomId) return;
    if (event.data.type === 'ROOM_UPDATE' && event.data.room) {
      onUpdate(event.data.room);
    } else if (event.data.type === 'CHEER' && event.data.cheer) {
      onCheer(event.data.cheer);
    }
  };

  broadcastChannel.addEventListener('message', handler);
  return () => {
    broadcastChannel?.removeEventListener('message', handler);
  };
}

function getLocalRoom(roomId: string): StudyRoom {
  try {
    const raw = localStorage.getItem(STORAGE_ROOM_PREFIX + roomId);
    if (raw) return JSON.parse(raw);
  } catch (_) {}

  return {
    roomId,
    roomName: roomId.replace(/-/g, ' '),
    members: [],
    recentCheers: [],
  };
}

function saveLocalRoom(roomId: string, room: StudyRoom): void {
  try {
    localStorage.setItem(STORAGE_ROOM_PREFIX + roomId, JSON.stringify(room));
  } catch (_) {}
}

function updateLocalRoomState(roomId: string, currentMember: RoomMember): StudyRoom {
  const existing = getLocalRoom(roomId);
  const now = Date.now();

  // Merge current member and remove stale offline members (> 25s)
  const otherMembers = existing.members.filter(
    (m) => m.userId !== currentMember.userId && now - m.lastActive < 25000
  );

  const updatedMembers = [currentMember, ...otherMembers];

  // Recalculate status
  const refreshedMembers = updatedMembers.map((m) => {
    if (now - m.lastActive > 15000) {
      return { ...m, status: 'offline' as const };
    }
    return m;
  });

  const updatedRoom: StudyRoom = {
    ...existing,
    members: refreshedMembers,
  };

  saveLocalRoom(roomId, updatedRoom);

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'ROOM_UPDATE', roomId, room: updatedRoom });
  }

  return updatedRoom;
}
