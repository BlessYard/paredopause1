import express from 'express';
import { createServer as createViteServer } from 'vite';

interface RoomMember {
  userId: string;
  displayName: string;
  avatarColor: string;
  phase: 'work' | 'rest';
  currentSet: number;
  totalSets: number;
  remainingSeconds: number;
  isRunning: boolean;
  lastActive: number;
  status: 'focusing' | 'resting' | 'paused' | 'idle' | 'offline';
}

interface RoomCheer {
  id: string;
  fromName: string;
  emoji: string;
  timestamp: number;
}

interface StudyRoom {
  roomId: string;
  roomName: string;
  members: RoomMember[];
  recentCheers: RoomCheer[];
}

const rooms = new Map<string, StudyRoom>();

async function startServer() {
  const app = express();
  app.use(express.json());

  // Room presence heartbeat endpoint
  app.post('/api/rooms/:roomId/heartbeat', (req, res) => {
    const { roomId } = req.params;
    const member = req.body as RoomMember;
    const now = Date.now();

    if (!member || !member.userId) {
      return res.status(400).json({ error: 'Invalid member payload' });
    }

    let room = rooms.get(roomId);
    if (!room) {
      room = {
        roomId,
        roomName: roomId.replace(/-/g, ' '),
        members: [],
        recentCheers: [],
      };
      rooms.set(roomId, room);
    }

    // Clean up members older than 25 seconds
    const activeMembers = room.members.filter(
      (m) => m.userId !== member.userId && now - m.lastActive < 25000
    );

    // Compute live status
    const currentStatus: RoomMember['status'] = !member.isRunning
      ? 'paused'
      : member.phase === 'work'
      ? 'focusing'
      : 'resting';

    activeMembers.unshift({
      ...member,
      lastActive: now,
      status: currentStatus,
    });

    room.members = activeMembers;
    res.json(room);
  });

  // Cheer endpoint (high-fives / fire / coffee)
  app.post('/api/rooms/:roomId/cheer', (req, res) => {
    const { roomId } = req.params;
    const cheer = req.body as RoomCheer;

    let room = rooms.get(roomId);
    if (!room) {
      room = {
        roomId,
        roomName: roomId.replace(/-/g, ' '),
        members: [],
        recentCheers: [],
      };
      rooms.set(roomId, room);
    }

    room.recentCheers = [cheer, ...room.recentCheers].slice(0, 10);
    res.json({ success: true, cheer });
  });

  // Room info endpoint
  app.get('/api/rooms/:roomId', (req, res) => {
    const { roomId } = req.params;
    const room = rooms.get(roomId) || {
      roomId,
      roomName: roomId.replace(/-/g, ' '),
      members: [],
      recentCheers: [],
    };
    res.json(room);
  });

  // Chronobiology Strategist Endpoint
  app.post('/api/strategist/generate', async (req, res) => {
    const { wakeTime, meetings, tasks } = req.body || {};

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI();

        const prompt = `Analyze this user's day:
Wake time: ${wakeTime || '07:00'}
Meetings: ${JSON.stringify(meetings || [])}
Tasks: ${JSON.stringify(tasks || [])}

Rules to enforce strictly:
1. Never schedule deep focus blocks during the post-lunch dip (1:00 PM - 3:00 PM).
2. Assign 50–60 minute blocks for complex/creative work and 25-minute blocks for high-friction or analytical tasks.
3. Keep the output actionable, concise, and structured as JSON.

Return JSON with this schema:
{
  "executiveSummary": string,
  "wakeTime": string,
  "circadianPeaks": {
    "morningAlertnessPeak": string,
    "postLunchDip": "1:00 PM - 3:00 PM (Strictly protected from deep focus)",
    "afternoonSecondWind": string
  },
  "paretoFocusBlocks": [
    {
      "blockId": string,
      "taskTitle": string,
      "category": "complex_creative" | "analytical_friction",
      "durationMinutes": number,
      "startTime": string,
      "endTime": string,
      "circadianPhase": "morning_peak" | "afternoon_second_wind",
      "rationale": string
    }
  ],
  "totalDeepWorkMinutes": number,
  "totalBreakMinutes": number,
  "unassignedTasks": string[],
  "recommendationNote": string
}`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction:
              'You are an executive chronobiology and productivity strategist for ParetoPause. Output only valid JSON.',
            responseMimeType: 'application/json',
          },
        });

        if (aiResponse && aiResponse.text) {
          const parsed = JSON.parse(aiResponse.text);
          return res.json(parsed);
        }
      } catch (err) {
        console.error('Gemini Strategist generation error, falling back:', err);
      }
    }

    // Fallback response with structured format adhering to all rules
    res.status(404).json({ fallback: true });
  });

  // 80/20 Productivity Director Endpoint
  app.post('/api/director/prioritize', async (req, res) => {
    const { rawTasks, currentTime, energyLevel, timerDurationMinutes } = req.body || {};
    const duration = timerDurationMinutes || 25;
    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const { GoogleGenAI } = await import('@google/genai');
        const ai = new GoogleGenAI();

        const prompt = `Act as a strict 80/20 productivity director.
Here are the things on the user's plate today:
${typeof rawTasks === 'string' ? rawTasks : JSON.stringify(rawTasks || [])}

Current time: ${currentTime || '08:00 AM'}
Energy level (1-10): ${energyLevel || 8}
Timer target: ${duration}-minute block

Enforce the Pareto Principle (80% of results come from 20% of effort).
Tell the user:
1. The ONE task they must set a ${duration}-minute timer for right now.
2. The specific first step to take in the first 2 minutes to eliminate friction.
3. Exactly what to ignore until this timer ends.

Return pure JSON matching this schema:
{
  "oneTask": string,
  "firstStep2Min": string,
  "ignoreList": string[],
  "rationale": string,
  "timerDurationMinutes": ${duration}
}`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction:
              'You are a strict executive 80/20 productivity director for ParetoPause. Output only valid JSON.',
            responseMimeType: 'application/json',
          },
        });

        if (aiResponse && aiResponse.text) {
          const parsed = JSON.parse(aiResponse.text);
          return res.json(parsed);
        }
      } catch (err) {
        console.error('Gemini Director prioritization error, falling back:', err);
      }
    }

    res.status(404).json({ fallback: true });
  });

  const isProduction = process.env.NODE_ENV === 'production';
  if (isProduction) {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const port = 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`ParetoPause server running on http://0.0.0.0:${port}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start ParetoPause server:', err);
});
